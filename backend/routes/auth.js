const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../utils/db');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [users] = await pool.execute(
            'SELECT id, full_name, personal_email, school_email, password_hash, role, has_ready_files, is_active FROM teachers WHERE (personal_email = ? OR school_email = ?) AND is_active = TRUE',
            [email, email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                has_ready_files: user.has_ready_files
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.json({ user: null });

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me');

        const [users] = await pool.execute(
            'SELECT id, full_name, role, personal_email, school_email, has_ready_files, is_active FROM teachers WHERE id = ? AND is_active = TRUE',
            [decoded.id]
        );

        if (users.length === 0) return res.json({ user: null });

        const user = users[0];
        res.json({
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                has_ready_files: user.has_ready_files
            }
        });
    } catch {
        res.json({ user: null });
    }
});

module.exports = router;
