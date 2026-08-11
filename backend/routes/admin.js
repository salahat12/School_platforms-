const express = require('express');
const pool = require('../utils/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [[teacherCount]] = await pool.execute(
            "SELECT COUNT(*) as count FROM teachers WHERE role = 'teacher' AND is_active = TRUE"
        );
        const [[subjectCount]] = await pool.execute('SELECT COUNT(*) as count FROM subjects');
        const [[gradeCount]] = await pool.execute('SELECT COUNT(*) as count FROM grades');
        const [[sectionCount]] = await pool.execute('SELECT COUNT(*) as count FROM sections');
        const [[fileCount]] = await pool.execute('SELECT COUNT(*) as count FROM files');
        const [[assignmentCount]] = await pool.execute('SELECT COUNT(*) as count FROM assignments');

        res.json({
            stats: {
                teachers: teacherCount.count,
                subjects: subjectCount.count,
                grades: gradeCount.count,
                sections: sectionCount.count,
                files: fileCount.count,
                assignments: assignmentCount.count
            }
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/distribution - Tree view: Grade → Subject → Section → Teacher
router.get('/distribution', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                a.grade,
                a.subject,
                a.section,
                t.id as teacher_id,
                t.full_name as teacher_name
            FROM assignments a
            JOIN teachers t ON a.teacher_id = t.id
            WHERE t.is_active = TRUE
            ORDER BY a.grade, a.subject, a.section, t.full_name
        `);

        // Build tree structure
        const tree = {};

        rows.forEach(row => {
            if (!tree[row.grade]) {
                tree[row.grade] = { grade: row.grade, subjects: {} };
            }
            if (!tree[row.grade].subjects[row.subject]) {
                tree[row.grade].subjects[row.subject] = { name: row.subject, sections: {} };
            }
            if (!tree[row.grade].subjects[row.subject].sections[row.section]) {
                tree[row.grade].subjects[row.subject].sections[row.section] = {
                    section: row.section,
                    teachers: []
                };
            }
            tree[row.grade].subjects[row.subject].sections[row.section].teachers.push({
                id: row.teacher_id,
                name: row.teacher_name
            });
        });

        res.json({ distribution: tree });
    } catch (err) {
        console.error('Distribution error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/duplicate-emails - Find teachers sharing the same school email
router.get('/duplicate-emails', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT school_email, COUNT(*) as count, GROUP_CONCAT(full_name SEPARATOR ', ') as teachers
            FROM teachers
            WHERE role = 'teacher' AND school_email IS NOT NULL
            GROUP BY school_email
            HAVING COUNT(*) > 1
        `);

        res.json({ duplicates: rows });
    } catch (err) {
        console.error('Duplicate emails error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
