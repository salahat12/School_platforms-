const jwt = require('jsonwebtoken');
const pool = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

function generateToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, email: user.personal_email || user.school_email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

async function authenticate(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await pool.execute(
            'SELECT id, full_name, role, personal_email, school_email, has_ready_files, is_active FROM teachers WHERE id = ? AND is_active = TRUE',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: User not found or inactive' });
        }

        req.user = users[0];
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
}

function requireTeacher(req, res, next) {
    if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden: Teacher access required' });
    }
    next();
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

module.exports = { generateToken, authenticate, requireAdmin, requireTeacher, requireAuth };
