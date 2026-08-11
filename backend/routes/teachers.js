const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../utils/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, requireAdmin);

// GET /api/teachers - List all teachers with assignment count
router.get('/', async (req, res) => {
    try {
        const [teachers] = await pool.execute(`
            SELECT t.*, COUNT(a.id) as assignment_count 
            FROM teachers t 
            LEFT JOIN assignments a ON t.id = a.teacher_id 
            WHERE t.role = 'teacher'
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `);

        // Don't send password hashes
        const safeTeachers = teachers.map(t => ({
            id: t.id,
            full_name: t.full_name,
            personal_email: t.personal_email,
            school_email: t.school_email,
            has_ready_files: t.has_ready_files,
            is_active: t.is_active,
            created_at: t.created_at,
            assignment_count: t.assignment_count
        }));

        res.json({ teachers: safeTeachers });
    } catch (err) {
        console.error('List teachers error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/teachers/:id - Get single teacher with assignments
router.get('/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;

        const [teachers] = await pool.execute(
            'SELECT id, full_name, personal_email, school_email, has_ready_files, is_active, created_at FROM teachers WHERE id = ? AND role = "teacher"',
            [teacherId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const [assignments] = await pool.execute(
            'SELECT * FROM assignments WHERE teacher_id = ? ORDER BY grade, subject, section',
            [teacherId]
        );

        res.json({ teacher: teachers[0], assignments });
    } catch (err) {
        console.error('Get teacher error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/teachers - Create new teacher
router.post('/', async (req, res) => {
    try {
        const { full_name, personal_email, school_email, password, has_ready_files } = req.body;

        if (!full_name || !password) {
            return res.status(400).json({ error: 'Full name and password are required' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO teachers (full_name, personal_email, school_email, password_hash, has_ready_files, role) VALUES (?, ?, ?, ?, ?, "teacher")',
            [full_name, personal_email || null, school_email || null, passwordHash, has_ready_files || 'not_ready_yet']
        );

        res.status(201).json({ 
            success: true, 
            teacherId: result.insertId,
            message: 'Teacher created successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('Create teacher error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/teachers/:id - Update teacher
router.put('/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { full_name, personal_email, school_email, has_ready_files, is_active, password } = req.body;

        let updates = [];
        let values = [];

        if (full_name) { updates.push('full_name = ?'); values.push(full_name); }
        if (personal_email !== undefined) { updates.push('personal_email = ?'); values.push(personal_email); }
        if (school_email !== undefined) { updates.push('school_email = ?'); values.push(school_email); }
        if (has_ready_files) { updates.push('has_ready_files = ?'); values.push(has_ready_files); }
        if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            values.push(passwordHash);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(teacherId);

        await pool.execute(
            `UPDATE teachers SET ${updates.join(', ')} WHERE id = ? AND role = 'teacher'`,
            values
        );

        res.json({ success: true, message: 'Teacher updated successfully' });
    } catch (err) {
        console.error('Update teacher error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/teachers/:id - Deactivate teacher (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;

        await pool.execute(
            "UPDATE teachers SET is_active = FALSE WHERE id = ? AND role = 'teacher'",
            [teacherId]
        );

        res.json({ success: true, message: 'Teacher deactivated successfully' });
    } catch (err) {
        console.error('Delete teacher error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/teachers/:id/assignments - Add assignment to teacher
router.post('/:id/assignments', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { subject, grade, section } = req.body;

        if (!subject || !grade || !section) {
            return res.status(400).json({ error: 'Subject, grade, and section are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO assignments (teacher_id, subject, grade, section) VALUES (?, ?, ?, ?)',
            [teacherId, subject, grade, section]
        );

        res.status(201).json({ 
            success: true, 
            assignmentId: result.insertId,
            message: 'Assignment added successfully'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Assignment already exists for this teacher' });
        }
        console.error('Add assignment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/teachers/:id/assignments/:assignmentId - Remove assignment
router.delete('/:id/assignments/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;

        await pool.execute('DELETE FROM assignments WHERE id = ?', [assignmentId]);

        res.json({ success: true, message: 'Assignment removed successfully' });
    } catch (err) {
        console.error('Delete assignment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
