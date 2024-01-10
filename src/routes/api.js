// routes/api.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const Todo = require('../models/todo'); 
const config = require('../config');

// User Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        const token = jwt.sign({ username: user.username }, config.jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Todo Creation
router.post('/todos', async (req, res) => {
    const { title, description, completed } = req.body;

    try {
        const todo = new Todo({ title, description, completed });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: 'An error occurred' });
    }
});

// Todo Retrieval
router.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Todo Update
router.put('/todos/:id', async (req, res) => {
    const { title, description, completed } = req.body;

    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { title, description, completed },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json(todo);
    } catch (error) {
        res.status(400).json({ message: 'An error occurred' });
    }
});

// Todo Deletion
router.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(400).json({ message: 'An error occurred' });
    }
});

module.exports = router;
