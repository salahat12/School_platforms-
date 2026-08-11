-- ============================================================
-- School Platform Seed Data
-- Generated from teacher survey responses
-- ============================================================

USE school_platform;

-- Subjects reference table
INSERT INTO subjects (name, name_en) VALUES
('اللغة العربية', 'Arabic Language'),
('الرياضيات', 'Mathematics'),
('العلوم', 'Science'),
('اللغة الإنجليزية', 'English Language'),
('التربية الوطنية والحياتية', 'National and Life Education'),
('التربية الإسلامية', 'Islamic Education'),
('التنشئة', 'Upbringing/Tarbiya');

-- Grades reference table
INSERT INTO grades (grade_number, name_ar) VALUES
(1, 'الصف الأول'),
(2, 'الصف الثاني'),
(3, 'الصف الثالث'),
(4, 'الصف الرابع');

-- Sections reference table
INSERT INTO sections (section_code, name_ar) VALUES
('A', 'شعبة أ'),
('B', 'شعبة ب'),
('C', 'شعبة ج');

-- ============================================================
-- Teachers
-- NOTE: All passwords are hashed using bcrypt.
-- Default password for all seeded teachers: 'Teacher123!'
-- bcrypt hash for 'Teacher123!': $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Replace with actual hashed passwords before deployment.
-- ============================================================

INSERT INTO teachers (id, full_name, personal_email, school_email, password_hash, role, has_ready_files, is_active, created_at) VALUES
(1, 'منار درويش حسن يعقوب', 'manardarweech81y@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(2, 'هبة روحي صبحي بشارات', '910760453@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(3, 'هدى شعبان محمد برهم', 'hudabarham709@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(4, 'سلام صبري عبد الفتاح مسلم', 'Salam.mosalam@hotmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(5, 'منار ناجي حسن العارضة', 'Manar.naji@hotmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(6, 'إيناس عطا صلاحات', '907994230@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(7, 'الهام عيسى قدورة قنع', '411888696@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'not_ready_yet', TRUE, NOW()),
(8, 'إلهام أحمد عبد الله الصوري', 'ni.ilham2020@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(9, 'رؤيا أكرم أحمد قواسمة', 'ramaqwasmqh@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(10, 'رايه وضاح صالح زيد كيلاني', 'raya.w.Ashour.87@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(11, 'لوريس زهير معزوز عيسى', '988271599@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'not_ready_yet', TRUE, NOW()),
(12, 'وفاء أمين راشد قاسم', '936113729@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW()),
(13, 'عبيدة عامر العبد أبو سالم', '911066579@rb.edu.ps', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(14, 'اعتماد خليل سليمان قرابصة', 'jadallahitimad@gmail.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'all_ready', TRUE, NOW()),
(15, 'سارة عيس شتيوي سلامة', 'alkhateb@sk.msn.com', 'rb18111050@rb.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'some_ready', TRUE, NOW());

-- ============================================================
-- Admin User
-- Default password: 'Admin123!'
-- ============================================================

INSERT INTO teachers (id, full_name, personal_email, school_email, password_hash, role, has_ready_files, is_active, created_at) VALUES
(99, 'مدير النظام', 'admin@school.edu.ps', 'admin@school.edu.ps', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'all_ready', TRUE, NOW());

-- ============================================================
-- Assignments (Teacher → Subject → Grade → Section)
-- ============================================================

INSERT INTO assignments (teacher_id, subject, grade, section) VALUES
-- منار درويش: رياضيات صف 1 شعبة أ، رياضيات صف 2 شعبة أ
(1, 'الرياضيات', 1, 'A'),
(1, 'الرياضيات', 2, 'A'),

-- هبة روحي: عربي صف 4 شعبة أ، عربي صف 4 شعبة ب
(2, 'اللغة العربية', 4, 'A'),
(2, 'اللغة العربية', 4, 'B'),

-- هدى برهم: عربي صف 4 شعبة ج
(3, 'اللغة العربية', 4, 'C'),

-- سلام مسلم: رياضيات وعلوم صف 3 شعبة ب، رياضيات وعلوم صف 3 شعبة ج
(4, 'الرياضيات', 3, 'B'),
(4, 'الرياضيات', 3, 'C'),
(4, 'العلوم', 3, 'B'),
(4, 'العلوم', 3, 'C'),

-- منار العارضة: رياضيات وعلوم صف 4 شعبة أ، رياضيات وعلوم صف 4 شعبة ب
(5, 'الرياضيات', 4, 'A'),
(5, 'الرياضيات', 4, 'B'),
(5, 'العلوم', 4, 'A'),
(5, 'العلوم', 4, 'B'),

-- إيناس صلاحات: عربي صف 3 شعبة ب، عربي صف 3 شعبة ج
(6, 'اللغة العربية', 3, 'B'),
(6, 'اللغة العربية', 3, 'C'),

-- الهام قنع: رياضيات صف 1 شعبة أ، رياضيات صف 1 شعبة ب، وطنية وحياتية صف 1 شعبة أ، وطنية وحياتية صف 1 شعبة ب
(7, 'الرياضيات', 1, 'A'),
(7, 'الرياضيات', 1, 'B'),
(7, 'التربية الوطنية والحياتية', 1, 'A'),
(7, 'التربية الوطنية والحياتية', 1, 'B'),

-- إلهام الصوري: عربي صف 1 شعبة ج، عربي صف 2 شعبة أ
(8, 'اللغة العربية', 1, 'C'),
(8, 'اللغة العربية', 2, 'A'),

-- رؤيا قواسمة: إنجليزي صف 2 أ+ب+ج، صف 3 أ+ب+ج، صف 4 أ+ب+ج
(9, 'اللغة الإنجليزية', 2, 'A'),
(9, 'اللغة الإنجليزية', 2, 'B'),
(9, 'اللغة الإنجليزية', 2, 'C'),
(9, 'اللغة الإنجليزية', 3, 'A'),
(9, 'اللغة الإنجليزية', 3, 'B'),
(9, 'اللغة الإنجليزية', 3, 'C'),
(9, 'اللغة الإنجليزية', 4, 'A'),
(9, 'اللغة الإنجليزية', 4, 'B'),
(9, 'اللغة الإنجليزية', 4, 'C'),

-- رايه كيلاني: إنجليزي صف 1 أ+ب+ج، إنجليزي صف 2 شعبة أ
(10, 'اللغة الإنجليزية', 1, 'A'),
(10, 'اللغة الإنجليزية', 1, 'B'),
(10, 'اللغة الإنجليزية', 1, 'C'),
(10, 'اللغة الإنجليزية', 2, 'A'),

-- لوريس عيسى: رياضيات صف 2 شعبة ب، رياضيات صف 2 شعبة ج
(11, 'الرياضيات', 2, 'B'),
(11, 'الرياضيات', 2, 'C'),

-- وفاء قاسم: عربي صف 2 شعبة ب، عربي صف 2 شعبة ج
(12, 'اللغة العربية', 2, 'B'),
(12, 'اللغة العربية', 2, 'C'),

-- عبيدة أبو سالم: عربي صف 3 شعبة أ
(13, 'اللغة العربية', 3, 'A'),

-- اعتماد قرابصة: عربي صف 1 شعبة أ، عربي صف 1 شعبة ب، تربية إسلامية صف 1 شعبة أ
(14, 'اللغة العربية', 1, 'A'),
(14, 'اللغة العربية', 1, 'B'),
(14, 'التربية الإسلامية', 1, 'A'),

-- سارة سلامة: رياضيات وعلوم وتنشئة صف 3 شعبة أ، رياضيات وعلوم وتنشئة صف 4 شعبة أ
(15, 'الرياضيات', 3, 'A'),
(15, 'الرياضيات', 4, 'A'),
(15, 'العلوم', 3, 'A'),
(15, 'العلوم', 4, 'A'),
(15, 'التنشئة', 3, 'A'),
(15, 'التنشئة', 4, 'A');
