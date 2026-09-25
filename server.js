import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Photography, Video, Experience, Project, Skill, Course, Creative } from './models.js';
import { configureCloudinary } from './lib/images.js';
import { errorHandler } from './lib/http.js';
import { createCrudRouter } from './routes/crud.js';
import blogRouter from './routes/blog.js';
import adminRouter from './routes/admin.js';

dotenv.config();
configureCloudinary();

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

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { message: 'Too many requests' }
}));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use('/api', adminRouter);
app.use('/api/blog', blogRouter);
app.use('/api/photography', createCrudRouter(Photography));
app.use('/api/videos', createCrudRouter(Video));
app.use('/api/experience', createCrudRouter(Experience, {
  sort: { order: 1, startDate: -1 },
  listFilter: (req) => (req.query.type ? { type: req.query.type } : {})
}));
app.use('/api/projects', createCrudRouter(Project, { sort: { order: 1, createdAt: -1 } }));
app.use('/api/skills', createCrudRouter(Skill));
app.use('/api/courses', createCrudRouter(Course));
app.use('/api/creatives', createCrudRouter(Creative));

app.use(errorHandler);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

export default app;
