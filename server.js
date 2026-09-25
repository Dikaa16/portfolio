import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { BlogPost, Photography, Video, Experience, Project, Skill, Course, Creative } from './models.js';

dotenv.config();
const app = express();
// Behind Render's proxy: use the client IP from X-Forwarded-For so rate limits are per visitor
app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB error:', error);
    process.exit(1);
  }
};

connectDB();

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { message: 'Too many requests' }
});

// Stricter limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts' }
});

app.use('/api/admin/login', loginLimiter);
app.use('/api/', limiter);

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server auth not configured' });
    }
    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isValid) return res.status(401).json({ message: 'Invalid password' });
    
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Auth middleware — protect all write routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary cleanup: delete images that no item uses anymore
const IMAGE_FIELDS = ['coverImage', 'imageUrl', 'thumbnail', 'logoUrl'];
const IMAGE_MODELS = [BlogPost, Photography, Video, Experience, Project, Creative];

// Only images this app uploaded (our cloud, under portfolio/) are ever deleted
const cloudinaryPublicId = (url) => {
  if (typeof url !== 'string') return null;
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  const match = url.slice(prefix.length).match(/(?:^|\/)v\d+\/(portfolio\/.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isImageInUse = async (url) => {
  const inFields = await Promise.all(IMAGE_MODELS.flatMap(Model =>
    IMAGE_FIELDS.filter(field => Model.schema.path(field)).map(field => Model.exists({ [field]: url }))
  ));
  if (inFields.some(Boolean)) return true;
  return Boolean(await BlogPost.exists({ content: { $regex: escapeRegex(url) } }));
};

// Call after the DB change. Pass the updated doc to only remove replaced images.
const cleanupImages = (oldDoc, newDoc = null) => {
  for (const field of IMAGE_FIELDS) {
    const url = oldDoc?.[field];
    const publicId = cloudinaryPublicId(url);
    if (!publicId || newDoc?.[field] === url) continue;
    isImageInUse(url)
      .then(inUse => inUse ? null : cloudinary.uploader.destroy(publicId))
      .catch(error => console.error('Cloudinary cleanup error:', error));
  }
};

// Multer stores file in memory temporarily (no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload endpoint — folder is passed as query param
// e.g. POST /api/upload?folder=photography
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Determine folder from query param (defaults to 'general')
    const folder = `portfolio/${req.query.folder || 'general'}`;

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' } // auto-optimize
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// BLOG ROUTES
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blog/all', authMiddleware, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/blog/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/blog', authMiddleware, async (req, res) => {
  try {
    const post = new BlogPost(req.body);
    if (post.published && !post.publishedAt) post.publishedAt = new Date();
    const saved = await post.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/blog/:id', authMiddleware, async (req, res) => {
  try {
    const was = await BlogPost.findById(req.params.id);
    if (!was) return res.status(404).json({ message: 'Not found' });
    if (req.body.published && !was.published && !req.body.publishedAt) {
      req.body.publishedAt = new Date();
    }
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    cleanupImages(was, post);
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/blog/:id', authMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    cleanupImages(post);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PHOTOGRAPHY ROUTES - REORDER FIRST!
app.put('/api/photography/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Photography.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/photography', async (req, res) => {
  try {
    const photos = await Photography.find().sort({ order: 1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/photography', authMiddleware, async (req, res) => {
  try {
    const photo = await new Photography(req.body).save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/photography/:id', authMiddleware, async (req, res) => {
  try {
    const old = await Photography.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Not found' });
    const photo = await Photography.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!photo) return res.status(404).json({ message: 'Not found' });
    cleanupImages(old, photo);
    res.json(photo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/photography/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Photography.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Not found' });
    cleanupImages(photo);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VIDEO ROUTES - REORDER FIRST!
app.put('/api/videos/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Video.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/videos', authMiddleware, async (req, res) => {
  try {
    const video = await new Video(req.body).save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const old = await Video.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Not found' });
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ message: 'Not found' });
    cleanupImages(old, video);
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    cleanupImages(video);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EXPERIENCE ROUTES - REORDER FIRST!
app.put('/api/experience/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Experience.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/experience', async (req, res) => {
  try {
    const query = req.query.type ? { type: req.query.type } : {};
    const exps = await Experience.find(query).sort({ order: 1, startDate: -1 });
    res.json(exps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/experience', authMiddleware, async (req, res) => {
  try {
    const exp = await new Experience(req.body).save();
    res.status(201).json(exp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
    const old = await Experience.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Not found' });
    const exp = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exp) return res.status(404).json({ message: 'Not found' });
    cleanupImages(old, exp);
    res.json(exp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
    const exp = await Experience.findByIdAndDelete(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Not found' });
    cleanupImages(exp);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROJECT ROUTES - REORDER FIRST!
app.put('/api/projects/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Project.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const project = await new Project(req.body).save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const old = await Project.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Not found' });
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Not found' });
    cleanupImages(old, project);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    cleanupImages(project);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SKILLS ROUTES - REORDER FIRST!
app.put('/api/skills/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Skill.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const skill = await new Skill(req.body).save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ message: 'Not found' });
    res.json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// COURSES ROUTES - REORDER FIRST!
app.put('/api/courses/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Course.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/courses', authMiddleware, async (req, res) => {
  try {
    const course = await new Course(req.body).save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/courses/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Not found' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/courses/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATIVES (OTHERS) ROUTES - REORDER FIRST!
app.put('/api/creatives/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(item => Creative.findByIdAndUpdate(item.id, { order: item.order })));
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/creatives', async (req, res) => {
  try {
    const creatives = await Creative.find().sort({ order: 1 });
    res.json(creatives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/creatives', authMiddleware, async (req, res) => {
  try {
    const creative = await new Creative(req.body).save();
    res.status(201).json(creative);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/creatives/:id', authMiddleware, async (req, res) => {
  try {
    const old = await Creative.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Not found' });
    const creative = await Creative.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!creative) return res.status(404).json({ message: 'Not found' });
    cleanupImages(old, creative);
    res.json(creative);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/creatives/:id', authMiddleware, async (req, res) => {
  try {
    const creative = await Creative.findByIdAndDelete(req.params.id);
    if (!creative) return res.status(404).json({ message: 'Not found' });
    cleanupImages(creative);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error!' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

export default app;