// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userRole = role && ['admin', 'teacher'].includes(role) ? role : 'admin';

        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, userRole]
        );

        const newUser = { id: result.lastID, name, email, role: userRole };

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const payload = { userId: user.id, email: user.email, role: user.role };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

        return res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login };
