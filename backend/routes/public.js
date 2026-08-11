const express = require('express');
const pool = require('../utils/db');
const router = express.Router();

// GET /api/public/grades - List all grades
router.get('/grades', async (req, res) => {
    try {
        const [grades] = await pool.execute(
            'SELECT grade_number as id, name_ar as name FROM grades ORDER BY grade_number'
        );
        res.json({ grades });
    } catch (err) {
        console.error('List grades error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/public/grades/:grade/subjects - Get subjects for a grade
router.get('/grades/:grade/subjects', async (req, res) => {
    try {
        const grade = req.params.grade;

        // Get subjects that have public files or assignments in this grade
        const [subjects] = await pool.execute(`
            SELECT DISTINCT s.name, s.name_en 
            FROM assignments a 
            JOIN subjects s ON a.subject = s.name 
            WHERE a.grade = ?
            ORDER BY s.name
        `, [grade]);

        res.json({ subjects });
    } catch (err) {
        console.error('List subjects error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/public/grades/:grade/subjects/:subject/sections - Get sections for grade+subject
router.get('/grades/:grade/subjects/:subject/sections', async (req, res) => {
    try {
        const { grade, subject } = req.params;

        const [sections] = await pool.execute(`
            SELECT DISTINCT sec.section_code as code, sec.name_ar as name
            FROM assignments a
            JOIN sections sec ON a.section = sec.section_code
            WHERE a.grade = ? AND a.subject = ?
            ORDER BY sec.section_code
        `, [grade, decodeURIComponent(subject)]);

        res.json({ sections });
    } catch (err) {
        console.error('List sections error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/public/grades/:grade/subjects/:subject/sections/:section/files - Get public files
router.get('/grades/:grade/subjects/:subject/sections/:section/files', async (req, res) => {
    try {
        const { grade, subject, section } = req.params;
        const decodedSubject = decodeURIComponent(subject);

        const [files] = await pool.execute(`
            SELECT f.id, f.file_name, f.file_type, f.uploaded_at, t.full_name as teacher_name
            FROM files f
            JOIN teachers t ON f.teacher_id = t.id
            WHERE f.grade = ? AND f.subject = ? AND f.section = ? AND f.visible_to_public = TRUE
            ORDER BY f.file_type, f.uploaded_at DESC
        `, [grade, decodedSubject, section]);

        // Group by file type
        const grouped = {};
        const fileTypes = ['lesson', 'worksheet', 'exam', 'activity', 'plan', 'other'];
        fileTypes.forEach(type => grouped[type] = []);

        files.forEach(f => {
            const type = f.file_type || 'other';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(f);
        });

        res.json({ files, grouped });
    } catch (err) {
        console.error('List public files error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
