const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('./config'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// JWT authentication middleware
app.use((req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todo-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Define API routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
