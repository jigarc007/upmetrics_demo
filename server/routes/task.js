const express = require('express');
const router = express.Router();
const Task = require('../schema/task');

/**
 * ✅ ADD TASK
 * POST /api/task
 */
router.post('/', async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const {
      title,
      description,
      columnId,
      position,
      priority,
      dueDate,
    } = req.body;

    const task = new Task({
      title,
      description,
      columnId,
      position,
      priority,
      dueDate,
      userId: req.user.userId, // from auth middleware
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create task',
      error: error.message,
    });
  }
});

/**
 * ✏️ UPDATE TASK
 * PUT /api/task/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId }, // owner check
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found or unauthorized',
      });
    }

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update task',
      error: error.message,
    });
  }
});

/**
 * 🗑️ DELETE TASK
 * DELETE /api/task/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId, // owner check
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found or unauthorized',
      });
    }

    res.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete task',
      error: error.message,
    });
  }
});
router.get('/get', async (req, res) => {
    try {
        const columns = await Task.find({ userId: req.user.userId });        
        res.status(200).send(columns);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }       
});

module.exports = router;
