const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Item = require('../../models/Item/additem');

// Utility: Check for valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Sanitize input fields
const allowedFields = ['title', 'subtitle', 'url', 'image', 'imageName'];
const sanitizeInput = (body) => {
  return allowedFields.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
};

// ✅ [GET] Get all items
router.get('/', async (req, res) => {
  console.log('📥 [GET] /api/item');
  try {
    const items = await Item.find().sort({ createdAt: -1 }).lean(); // lean() for performance
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('❌ [GET /] Failed to load items:', err);
    res.status(500).json({ success: false, message: 'Failed to load items' });
  }
});

// ✅ [GET] Get single item by ID
router.get('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID' });
  }

  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error(`❌ [GET /${req.params.id}] Error:`, err);
    res.status(500).json({ success: false, message: 'Error fetching item' });
  }
});

// ✅ [POST] Create new item
router.post('/', async (req, res) => {
  const data = sanitizeInput(req.body);

  if (!data.title || data.title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  try {
    const newItem = new Item(data);
    const savedItem = await newItem.save();
    res.status(201).json({ success: true, message: 'Item added', data: savedItem });
  } catch (err) {
    console.error('❌ [POST /] Failed to add item:', err);
    res.status(500).json({ success: false, message: 'Failed to add item' });
  }
});

// ✅ [PUT] Update item
router.put('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID' });
  }

  const updateData = sanitizeInput(req.body);

  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: 'Item updated', data: updatedItem });
  } catch (err) {
    console.error(`❌ [PUT /${req.params.id}] Update failed:`, err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ✅ [DELETE] Delete item
router.delete('/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID' });
  }

  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: 'Item deleted', data: deletedItem });
  } catch (err) {
    console.error(`❌ [DELETE /${req.params.id}] Failed to delete item:`, err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
