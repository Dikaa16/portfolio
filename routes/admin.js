import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/http.js';
import { uploadImage } from '../lib/images.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  skipSuccessfulRequests: true,
  message: { message: 'Too many login attempts' }
});

router.post('/admin/login', loginLimiter, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server auth not configured' });
  }
  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!isValid) return res.status(401).json({ message: 'Invalid password' });

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
}));

// Files are held in memory only long enough to stream them to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// POST /api/upload?folder=photography
router.post('/upload', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });

  const folder = `portfolio/${req.query.folder || 'general'}`;
  try {
    const result = await uploadImage(req.file.buffer, folder);
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    // Admin-only: Cloudinary's message helps diagnose failed uploads
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
}));

export default router;
