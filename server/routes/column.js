const express = require('express');
const router = express.Router();
const Column = require('../schema/column');   
const task = require('../schema/task');
router.post('/add', async (req, res) => {
  try {
    let result;
    console.log('column REQ BODY:', req.body);

    // ✅ If req.body is an array → insert multiple records
    if (Array.isArray(req.body)) {
      result = await Column.insertMany(req.body);
    } 
    // ✅ If req.body is an object → insert single record
    else {
      const column = new Column(req.body);
      result = await column.save();
      console.log('Single column added:', result);
    }

    res.status(201).json({
      message: 'Column(s) added successfully',
      data: result
    });

  } catch (error) {
    res.status(400).json({
      message: 'Failed to add column(s)',
      error: error.message
    });
  }
});

router.put('/update/:id',async (req,res)=>{
  try {
    console.log("column updated:>",req.body)
      const column = await Column.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId }, // owner check
        req.body,
        { new: true }
      );
  
      if (!column) {
        return res.status(404).json({
          message: 'Column not found or unauthorized',
        });
      }
  
      res.json({
        message: 'Column updated successfully',
        column,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update task',
        error: error.message,
      });
    }
})
router.delete('/del/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Column.deleteOne({ _id: id, userId: req.user.userId });
        await task.deleteMany({ columnId: id });
        res.status(200).send({ message: 'Column deleted successfully' });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }       
});
router.get('/get', async (req, res) => {
    try {
        const columns = await Column.find({ userId: req.user.userId });        
        res.status(200).send(columns);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }       
});
module.exports = router;