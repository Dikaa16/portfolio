import express from 'express';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler, writableFields, notFound } from '../lib/http.js';
import { cleanupImages } from '../lib/images.js';

// Standard list/create/update/delete/reorder routes for an orderable model
export function createCrudRouter(Model, { sort = { order: 1 }, listFilter = () => ({}) } = {}) {
  const router = express.Router();

  // Registered before /:id so "reorder" is not treated as an id
  router.put('/reorder', requireAuth, asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

    await Model.bulkWrite(items.map(({ id, order }) => ({
      updateOne: { filter: { _id: id }, update: { order } }
    })));
    res.json({ message: 'Updated' });
  }));

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await Model.find(listFilter(req)).sort(sort));
  }));

  router.post('/', requireAuth, asyncHandler(async (req, res) => {
    const doc = await new Model(writableFields(req.body)).save();
    res.status(201).json(doc);
  }));

  router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
    const old = await Model.findById(req.params.id);
    if (!old) return notFound(res);

    const doc = await Model.findByIdAndUpdate(req.params.id, writableFields(req.body), { new: true, runValidators: true });
    if (!doc) return notFound(res);
    cleanupImages(old, doc);
    res.json(doc);
  }));

  router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return notFound(res);
    cleanupImages(doc);
    res.json({ message: 'Deleted' });
  }));

  return router;
}
