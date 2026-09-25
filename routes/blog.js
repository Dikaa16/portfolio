import express from 'express';
import { BlogPost } from '../models.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler, writableFields, notFound } from '../lib/http.js';
import { cleanupImages } from '../lib/images.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json(await BlogPost.find({ published: true }).sort({ publishedAt: -1 }));
}));

// Drafts included; registered before /:slug so "all" is not treated as a slug
router.get('/all', requireAuth, asyncHandler(async (req, res) => {
  res.json(await BlogPost.find().sort({ createdAt: -1 }));
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
  if (!post) return notFound(res);
  res.json(post);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const post = new BlogPost(writableFields(req.body));
  if (post.published && !post.publishedAt) post.publishedAt = new Date();
  res.status(201).json(await post.save());
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const old = await BlogPost.findById(req.params.id);
  if (!old) return notFound(res);

  const data = writableFields(req.body);
  if (data.published && !old.published && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  const post = await BlogPost.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!post) return notFound(res);
  cleanupImages(old, post);
  res.json(post);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return notFound(res);
  cleanupImages(post);
  res.json({ message: 'Deleted' });
}));

export default router;
