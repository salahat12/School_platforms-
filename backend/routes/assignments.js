const express = require('express');
const pool = require('../utils/db');
const { authenticate, requireTeacher } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

// GET /api/assignments/my - Get current teacher's assignments
router.get('/my', requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        const [assignments] = await pool.execute(
            `SELECT id, subject, grade, section, created_at 
             FROM assignments 
             WHERE teacher_id = ? 
             ORDER BY grade, subject, section`,
            [teacherId]
        );

        // Group by subject+grade for dashboard cards
        const grouped = {};
        assignments.forEach(a => {
            const key = `${a.subject}|${a.grade}`;
            if (!grouped[key]) {
                grouped[key] = {
                    subject: a.subject,
                    grade: a.grade,
                    sections: [],
                    assignment_ids: []
                };
            }
            grouped[key].sections.push(a.section);
            grouped[key].assignment_ids.push(a.id);
        });

        res.json({ 
            assignments,
            grouped: Object.values(grouped)
        });
    } catch (err) {
        console.error('Get my assignments error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/assignments/check - Verify teacher has this exact assignment
router.get('/check', requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { subject, grade, section } = req.query;

        const [assignments] = await pool.execute(
            'SELECT id FROM assignments WHERE teacher_id = ? AND subject = ? AND grade = ? AND section = ?',
            [teacherId, subject, grade, section]
        );

        res.json({ hasAssignment: assignments.length > 0 });
    } catch (err) {
        console.error('Check assignment error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
