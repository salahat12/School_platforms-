const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(helmet());

// Logging
app.use(morgan('combined'));

// CORS: allowlist via env or defaults
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3002').split(',');
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (mobile apps, curl, same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true
}));

// Basic rate limiters
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many auth attempts, please try again later.' });
app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs to prevent NoSQL/SQL injection via payloads
app.use(mongoSanitize());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'frontend')));
// Note: static assets should be placed under `frontend/assets` and will be served
// by the express.static middleware above (e.g. /assets/logo.jpg -> frontend/assets/logo.jpg).

// API Routes
app.use('/api/auth', authLimiter, require('./backend/routes/auth'));
app.use('/api/teachers', require('./backend/routes/teachers'));
app.use('/api/assignments', require('./backend/routes/assignments'));
app.use('/api/files', require('./backend/routes/files'));
app.use('/api/public', require('./backend/routes/public'));
app.use('/api/admin', require('./backend/routes/admin'));
app.use('/api/chat', require('./backend/routes/chat'));

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/index.html')));
app.get('/grades', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/grades.html')));
app.get('/grade/:grade', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/grade.html')));
app.get('/grade/:grade/subject/:subject', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/subject.html')));
app.get('/grade/:grade/subject/:subject/section/:section', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/section.html')));
app.get('/chat-ai', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/chat-ai.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/about.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/login.html')));
app.get('/teacher-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/teacher-dashboard.html')));
app.get('/teacher-files', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/teacher-files.html')));
app.get('/teacher-upload', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/teacher-upload.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/admin-dashboard.html')));
app.get('/admin-teachers', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/admin-teachers.html')));
app.get('/admin-files', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/admin-files.html')));
app.get('/admin-distribution', (req, res) => res.sendFile(path.join(__dirname, 'frontend/pages/admin-distribution.html')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`🚀 School Platform running on http://localhost:${port}`);
        console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './uploads'}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is already in use.`);
            const fallbackPort = Number(port) + 1;
            console.warn(`Trying port ${fallbackPort} instead...`);
            startServer(fallbackPort);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
};

startServer(PORT);
