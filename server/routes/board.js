const express = require('express');
const router = express.Router();
const Board = require('../schema/board');   

router.post('/add', async (req, res) => {
    try {
        const board = new Board(req.body);          
        await board.save();
        res.status(201).send(board);
    }
    catch (error) {
        res.status(400).send({ error: error.message });
    }       
});

router.get('/get', async (req, res) => {
    try {
        console.log("Fetching boards",req.user);
        const boards = await Board.find({ userId: req.user.userId });        
        res.status(200).send(boards);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }       
});
module.exports = router;