const express = require('express');
const router = express.Router();
const List = require('../../models/lists/list');

// ✅ GET all lists
router.get('/', async (req, res) => {
  try {
    const lists = await List.find().sort({ createdAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// ✅ POST create new list
router.post('/', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const newList = new List({ title, subtitle });
    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create list' });
  }
});

// ✅ PUT update list by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const updated = await List.findByIdAndUpdate(
      req.params.id,
      { title, subtitle },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'List not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update list' });
  }
});

// ✅ DELETE list by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await List.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'List not found' });
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete list' });
  }
});

module.exports = router;
