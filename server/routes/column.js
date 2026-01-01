const express = require('express');
const router = express.Router();
const Column = require('../schema/column');   

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


router.get('/get', async (req, res) => {
    try {
        const columns = await Column.find();        
        res.status(200).send(columns);
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