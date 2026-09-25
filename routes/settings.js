import express from 'express';
import { Settings } from '../models.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/http.js';

const router = express.Router();
const SITE = { key: 'site' };

const publicSettings = (doc) => ({ theme: doc?.theme ?? 'classic' });

router.get('/', asyncHandler(async (req, res) => {
  res.json(publicSettings(await Settings.findOne(SITE)));
}));

// Only known fields are written; the schema validates the theme id format
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const doc = await Settings.findOneAndUpdate(
    SITE,
    { theme: req.body.theme },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json(publicSettings(doc));
}));

export default router;
