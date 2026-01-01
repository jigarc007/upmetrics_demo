const express = require('express');
const app = express();
const port = 4000;  
const bodyParser = require('body-parser');
const cors = require('cors');   
const mongoose = require('mongoose');
const authMiddleware = require('./middleware/auth.middleware');
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(authMiddleware);

const connection=()=>{
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/task_managment');
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}
connection();

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/board', require('./routes/board'));
app.use('/api/column', require('./routes/column'));
app.use('/api/user', require('./routes/user'));
app.use('/api/task', require('./routes/task'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
