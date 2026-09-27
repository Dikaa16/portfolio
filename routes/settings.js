import express from 'express';
import { Settings } from '../models.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/http.js';

const router = express.Router();
const SITE = { key: 'site' };

const FIELDS = ['theme', 'background'];

const publicSettings = (doc) => ({
  theme: doc?.theme ?? 'classic',
  background: doc?.background ?? 'auto'
});

router.get('/', asyncHandler(async (req, res) => {
  res.json(publicSettings(await Settings.findOne(SITE)));
}));

// Only the known fields that were sent are written; the schema validates their format
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const update = Object.fromEntries(
    FIELDS.filter(field => req.body[field] !== undefined).map(field => [field, String(req.body[field])])
  );
  if (!Object.keys(update).length) {
    return res.status(400).json({ message: 'No settings to update' });
  }
  const doc = await Settings.findOneAndUpdate(
    SITE,
    update,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json(publicSettings(doc));
}));

export default router;
