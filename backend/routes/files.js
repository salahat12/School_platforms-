const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../utils/db');
const { authenticate, requireTeacher, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET /api/files - Get files (teacher sees own, admin sees all)
router.get('/', authenticate, async (req, res) => {
    try {
        let query, params;

        if (req.user.role === 'admin') {
            query = `
                SELECT f.*, t.full_name as teacher_name 
                FROM files f 
                JOIN teachers t ON f.teacher_id = t.id 
                ORDER BY f.uploaded_at DESC
            `;
            params = [];
        } else {
            query = `
                SELECT * FROM files 
                WHERE teacher_id = ? 
                ORDER BY uploaded_at DESC
            `;
            params = [req.user.id];
        }

        const [files] = await pool.execute(query, params);
        res.json({ files });
    } catch (err) {
        console.error('List files error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/files/assignment - Get files for specific assignment
router.get('/assignment', authenticate, async (req, res) => {
    try {
        const { subject, grade, section } = req.query;

        if (!subject || !grade || !section) {
            return res.status(400).json({ error: 'Subject, grade, and section are required' });
        }

        let query, params;

        if (req.user.role === 'admin') {
            query = `
                SELECT f.*, t.full_name as teacher_name 
                FROM files f 
                JOIN teachers t ON f.teacher_id = t.id 
                WHERE f.subject = ? AND f.grade = ? AND f.section = ?
                ORDER BY f.uploaded_at DESC
            `;
            params = [subject, grade, section];
        } else {
            // Teacher can only see their own files for this assignment
            query = `
                SELECT * FROM files 
                WHERE teacher_id = ? AND subject = ? AND grade = ? AND section = ?
                ORDER BY uploaded_at DESC
            `;
            params = [req.user.id, subject, grade, section];
        }

        const [files] = await pool.execute(query, params);
        res.json({ files });
    } catch (err) {
        console.error('Get assignment files error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/files/upload - Upload file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const teacherId = req.user.id;
        const { subject, grade, section, file_type, file_name } = req.body;

        if (!subject || !grade || !section || !file_type) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Subject, grade, section, and file_type are required' });
        }

        // Verify teacher owns this assignment (server-side enforcement)
        if (req.user.role !== 'admin') {
            const [assignments] = await pool.execute(
                'SELECT id FROM assignments WHERE teacher_id = ? AND subject = ? AND grade = ? AND section = ?',
                [teacherId, subject, grade, section]
            );

            if (assignments.length === 0) {
                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
                return res.status(403).json({ error: 'You are not assigned to this subject/grade/section combination' });
            }
        }

        const displayName = file_name || req.file.originalname;

        const [result] = await pool.execute(
            `INSERT INTO files (teacher_id, subject, grade, section, file_type, file_name, original_name, storage_path, mime_type, file_size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                teacherId, subject, grade, section, file_type,
                displayName, req.file.originalname, req.file.path,
                req.file.mimetype, req.file.size
            ]
        );

        res.status(201).json({
            success: true,
            fileId: result.insertId,
            message: 'File uploaded successfully'
        });
    } catch (err) {
        // Clean up on error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// GET /api/files/:id/download - Download file
router.get('/:id/download', authenticate, async (req, res) => {
    try {
        const fileId = req.params.id;

        const [files] = await pool.execute('SELECT * FROM files WHERE id = ?', [fileId]);

        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Authorization check: teacher can only download own files, admin can download any
        if (req.user.role !== 'admin' && file.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to access this file' });
        }

        if (!fs.existsSync(file.storage_path)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.download(file.storage_path, file.original_name);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/files/:id - Update file metadata
router.put('/:id', authenticate, async (req, res) => {
    try {
        const fileId = req.params.id;
        const { file_name, file_type } = req.body;

        const [files] = await pool.execute('SELECT teacher_id FROM files WHERE id = ?', [fileId]);

        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Authorization check
        if (req.user.role !== 'admin' && files[0].teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to edit this file' });
        }

        let updates = [];
        let values = [];

        if (file_name) { updates.push('file_name = ?'); values.push(file_name); }
        if (file_type) { updates.push('file_type = ?'); values.push(file_type); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(fileId);
        await pool.execute(`UPDATE files SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true, message: 'File updated successfully' });
    } catch (err) {
        console.error('Update file error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const fileId = req.params.id;

        const [files] = await pool.execute('SELECT * FROM files WHERE id = ?', [fileId]);

        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Authorization check
        if (req.user.role !== 'admin' && file.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this file' });
        }

        // Delete from disk
        if (fs.existsSync(file.storage_path)) {
            fs.unlinkSync(file.storage_path);
        }

        // Delete from database
        await pool.execute('DELETE FROM files WHERE id = ?', [fileId]);

        res.json({ success: true, message: 'File deleted successfully' });
    } catch (err) {
        console.error('Delete file error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/files/:id/visibility - Toggle public visibility (admin only)
router.patch('/:id/visibility', authenticate, requireAdmin, async (req, res) => {
    try {
        const fileId = req.params.id;
        const { visible_to_public } = req.body;

        await pool.execute(
            'UPDATE files SET visible_to_public = ? WHERE id = ?',
            [visible_to_public ? 1 : 0, fileId]
        );

        res.json({ success: true, message: 'Visibility updated' });
    } catch (err) {
        console.error('Visibility update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
