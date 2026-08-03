-- ============================================================
-- V7: Seed data — Vietnamese university sample data
-- Local & Dev only (this file is NOT included in prod Flyway locations)
-- ============================================================

-- ── Users: 10 students + 3 lecturers ─────────────────────────

INSERT INTO users (id, name, username, email, auth_provider, is_active, provisioned_by, provisioned_at, created_at, updated_at)
VALUES
  -- Lecturers
  ('11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',  'tranducthinh',   'tran.duc.thinh@iu.edu.vn',        'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',  'nguyenthimai',   'nguyen.thi.mai@iu.edu.vn',        'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',     'levanhung',      'le.van.hung@iu.edu.vn',           'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  -- Students
  ('22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',   'nguyenvanan',    'nguyen.van.a@student.iu.edu.vn',  'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',   'tranthibinh',    'tran.thi.b@student.iu.edu.vn',   'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường',  'lehoangcuong',   'le.hoang.c@student.iu.edu.vn',   'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',   'phamthidung',    'pham.thi.d@student.iu.edu.vn',   'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức',  'hoangminhduc',   'hoang.minh.d@student.iu.edu.vn', 'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      'vuthihoa',       'vu.thi.h@student.iu.edu.vn',     'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh',  'dangvankhanh',   'dang.van.k@student.iu.edu.vn',   'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',     'buithilan',      'bui.thi.l@student.iu.edu.vn',    'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',    'ngoducmanh',     'ngo.duc.m@student.iu.edu.vn',    'microsoft', TRUE, 'system', NOW(), NOW(), NOW()),
  ('22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',   'phanthingoc',    'phan.thi.n@student.iu.edu.vn',   'microsoft', TRUE, 'system', NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ── Roles ─────────────────────────────────────────────────────
INSERT INTO user_roles (user_id, role)
VALUES
  ('11110001-0000-0000-0000-000000000001', 'lecturer'),
  ('11110001-0000-0000-0000-000000000002', 'lecturer'),
  ('11110001-0000-0000-0000-000000000003', 'lecturer'),
  ('22220001-0000-0000-0000-000000000001', 'student'),
  ('22220001-0000-0000-0000-000000000002', 'student'),
  ('22220001-0000-0000-0000-000000000003', 'student'),
  ('22220001-0000-0000-0000-000000000004', 'student'),
  ('22220001-0000-0000-0000-000000000005', 'student'),
  ('22220001-0000-0000-0000-000000000006', 'student'),
  ('22220001-0000-0000-0000-000000000007', 'student'),
  ('22220001-0000-0000-0000-000000000008', 'student'),
  ('22220001-0000-0000-0000-000000000009', 'student'),
  ('22220001-0000-0000-0000-000000000010', 'student')
ON CONFLICT DO NOTHING;

-- ── Courses (5) ───────────────────────────────────────────────
-- creator_id references a lecturer user

INSERT INTO courses (id, name, code, semester, description, cover_color, is_active, creator_id, created_at, updated_at)
VALUES
  ('cccc0001-0000-0000-0000-000000000001',
   'Giải tích I', 'MATH101', '2024-2025 S1',
   'Giới thiệu về giải tích một biến: giới hạn, đạo hàm, tích phân và ứng dụng.',
   '#0B2275', TRUE, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),

  ('cccc0001-0000-0000-0000-000000000002',
   'Nhập môn Lập trình', 'CS101', '2024-2025 S1',
   'Các khái niệm cơ bản về lập trình: biến, cấu trúc điều khiển, hàm và kiểu dữ liệu cơ bản.',
   '#007A5E', TRUE, '11110001-0000-0000-0000-000000000002', NOW(), NOW()),

  ('cccc0001-0000-0000-0000-000000000003',
   'Cấu trúc Dữ liệu & Giải thuật', 'CS201', '2024-2025 S2',
   'Mảng, danh sách liên kết, cây, đồ thị và các thuật toán sắp xếp, tìm kiếm cơ bản.',
   '#9B1D20', TRUE, '11110001-0000-0000-0000-000000000003', NOW(), NOW()),

  ('cccc0001-0000-0000-0000-000000000004',
   'Cơ sở Dữ liệu', 'CS301', '2024-2025 S2',
   'Mô hình quan hệ, SQL, chuẩn hóa dữ liệu và thiết kế cơ sở dữ liệu.',
   '#5B4A8A', TRUE, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),

  ('cccc0001-0000-0000-0000-000000000005',
   'Đại số Tuyến tính', 'MATH201', '2024-2025 S1',
   'Ma trận, hệ phương trình tuyến tính, không gian vectơ và trị riêng.',
   '#B8530A', TRUE, '11110001-0000-0000-0000-000000000002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Course Groups (2 per course = 10 groups) ──────────────────

INSERT INTO course_groups (id, course_id, lecturer_id, lecturer_name, name, description, created_at)
VALUES
  -- MATH101
  ('aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh', 'Nhóm MATH101-01', 'Nhóm học sáng thứ 2', NOW()),
  ('aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh', 'Nhóm MATH101-02', 'Nhóm học chiều thứ 4', NOW()),
  -- CS101
  ('aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai', 'Nhóm CS101-01', 'Nhóm học sáng thứ 3', NOW()),
  ('aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai', 'Nhóm CS101-02', 'Nhóm học chiều thứ 5', NOW()),
  -- CS201
  ('aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003',
   '11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',   'Nhóm CS201-01', 'Nhóm học sáng thứ 2', NOW()),
  ('aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003',
   '11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',   'Nhóm CS201-02', 'Nhóm học chiều thứ 4', NOW()),
  -- CS301
  ('aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh', 'Nhóm CS301-01', 'Nhóm học sáng thứ 3', NOW()),
  ('aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh', 'Nhóm CS301-02', 'Nhóm học chiều thứ 5', NOW()),
  -- MATH201
  ('aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai', 'Nhóm MATH201-01', 'Nhóm học sáng thứ 2', NOW()),
  ('aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai', 'Nhóm MATH201-02', 'Nhóm học chiều thứ 4', NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Group Members (distribute 10 students across groups) ──────
-- Students 1-5 in group -01 of each course
-- Students 6-10 in group -02 of each course

INSERT INTO group_members (id, group_id, course_id, student_id, student_name, created_at)
VALUES
  -- MATH101-01 (students 1-5)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', NOW()),
  -- MATH101-02 (students 6-10)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',    NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',   NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',  NOW()),

  -- CS101-01 (students 1-5)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', NOW()),
  -- CS101-02 (students 6-10)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',    NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',   NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',  NOW()),

  -- CS201-01 (students 1-5)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', NOW()),
  -- CS201-02 (students 6-10)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',    NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',   NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',  NOW()),

  -- CS301-01 (students 1-5)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', NOW()),
  -- CS301-02 (students 6-10)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',    NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',   NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',  NOW()),

  -- MATH201-01 (students 1-5)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', NOW()),
  -- MATH201-02 (students 6-10)
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh', NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',    NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',   NOW()),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',  NOW())
ON CONFLICT (group_id, student_id) DO NOTHING;

-- ── Course Posts (2 per course: 1 announcement + 1 assignment) ─

INSERT INTO course_posts (id, course_id, author_id, author_name, title, body, type, is_published, due_date, created_at, updated_at)
VALUES
  -- MATH101
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',
   'Chào mừng đến với Giải tích I',
   'Xin chào các em! Môn học Giải tích I sẽ bắt đầu vào tuần sau. Các em vui lòng đọc trước chương 1 trong giáo trình.',
   'announcement', TRUE, NULL,
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',
   'Bài tập về nhà số 1 – Giới hạn và liên tục',
   'Làm các bài 1.1 – 1.15 trong sách bài tập. Nộp bài trước deadline.',
   'assignment', TRUE, NOW() + INTERVAL '7 days',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  -- CS101
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',
   'Giới thiệu môn Nhập môn Lập trình',
   'Chào các em! Môn học sử dụng ngôn ngữ Python. Các em cần cài đặt Python 3.11+ và VS Code trước buổi học đầu tiên.',
   'announcement', TRUE, NULL,
   NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',
   'Lab 1 – Biến và kiểu dữ liệu',
   'Viết chương trình Python thực hiện các phép tính cơ bản và in kết quả. Nộp file .py qua hệ thống.',
   'assignment', TRUE, NOW() + INTERVAL '5 days',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  -- CS201
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003',
   '11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',
   'Kế hoạch môn CTDL & GT học kỳ 2',
   'Semester 2 sẽ tập trung vào cây nhị phân tìm kiếm, đồ thị và các thuật toán tìm đường đi. Lịch kiểm tra giữa kỳ: tuần 8.',
   'announcement', TRUE, NULL,
   NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003',
   '11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',
   'Bài tập Sắp xếp và Tìm kiếm',
   'Cài đặt Merge Sort, Quick Sort và Binary Search bằng Java. Viết unit test cho mỗi thuật toán.',
   'assignment', TRUE, NOW() + INTERVAL '10 days',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  -- CS301
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',
   'Thông báo: Cài đặt PostgreSQL cho môn CSDL',
   'Các em cài đặt PostgreSQL 16 và pgAdmin 4 trước buổi thực hành đầu tiên. Hướng dẫn cài đặt xem file đính kèm.',
   'announcement', TRUE, NULL,
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',
   'Đồ án giữa kỳ: Thiết kế CSDL quản lý thư viện',
   'Thiết kế ERD và triển khai CSDL cho hệ thống quản lý thư viện. Nộp báo cáo + file SQL.',
   'assignment', TRUE, NOW() + INTERVAL '14 days',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

  -- MATH201
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',
   'Tài liệu học tập môn Đại số Tuyến tính',
   'Tài liệu tham khảo chính: "Linear Algebra Done Right" – Sheldon Axler (bản PDF đã được upload lên hệ thống).',
   'announcement', TRUE, NULL,
   NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',
   'Bài tập Ma trận và Định thức',
   'Giải các bài tập trong chương 2 và 3. Trình bày lời giải rõ ràng, có giải thích từng bước.',
   'assignment', TRUE, NOW() + INTERVAL '6 days',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')

ON CONFLICT (id) DO NOTHING;

-- ── Course Grades (5 students × 3 courses = 15 rows) ──────────
-- Students 1–5 graded in MATH101, CS101, CS201

INSERT INTO course_grades (id, course_id, student_id, student_name, quiz, exercise, lab, midterm, project, final_score, graded_by, created_at, updated_at)
VALUES
  -- MATH101 — students 1-5
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  8.5,  8.0,  NULL, 7.5,  NULL, 8.0,  '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  9.0,  8.5,  NULL, 8.5,  NULL, 8.8,  '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', 7.0,  7.5,  NULL, 6.5,  NULL, 7.0,  '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  8.0,  9.0,  NULL, 8.0,  NULL, 8.3,  '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', 6.5,  7.0,  NULL, 6.0,  NULL, 6.5,  '11110001-0000-0000-0000-000000000001', NOW(), NOW()),

  -- CS101 — students 1-5
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  9.0,  NULL, 8.5,  8.5,  9.0,  8.8,  '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  8.5,  NULL, 9.0,  9.0,  8.5,  8.9,  '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', 7.5,  NULL, 7.0,  7.5,  8.0,  7.6,  '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  8.0,  NULL, 8.5,  8.0,  7.5,  8.0,  '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', 7.0,  NULL, 6.5,  7.0,  7.5,  7.0,  '11110001-0000-0000-0000-000000000002', NOW(), NOW()),

  -- CS201 — students 1-5
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  8.0,  NULL, 9.0,  8.5,  9.5,  8.8,  '11110001-0000-0000-0000-000000000003', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  9.0,  NULL, 8.5,  9.0,  9.0,  9.0,  '11110001-0000-0000-0000-000000000003', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', 6.5,  NULL, 7.5,  7.0,  7.0,  7.0,  '11110001-0000-0000-0000-000000000003', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  7.5,  NULL, 8.0,  7.5,  8.5,  7.9,  '11110001-0000-0000-0000-000000000003', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000003', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', 7.0,  NULL, 7.0,  6.5,  7.5,  7.0,  '11110001-0000-0000-0000-000000000003', NOW(), NOW())

ON CONFLICT (course_id, student_id) DO NOTHING;

-- ── Notifications ──────────────────────────────────────────────

INSERT INTO notifications (id, user_id, type, actor_name, message, read, link_to, created_at)
VALUES
  (gen_random_uuid(), '22220001-0000-0000-0000-000000000001', 'grade',
   'Trần Đức Thịnh',
   'Điểm môn Giải tích I của bạn đã được cập nhật. Điểm tổng kết: 8.0',
   FALSE, '/courses/cccc0001-0000-0000-0000-000000000001/grades',
   NOW() - INTERVAL '2 days'),

  (gen_random_uuid(), '22220001-0000-0000-0000-000000000002', 'course',
   'Nguyễn Thị Mai',
   'Giảng viên Nguyễn Thị Mai đã đăng bài tập mới trong môn Nhập môn Lập trình.',
   FALSE, '/courses/cccc0001-0000-0000-0000-000000000002',
   NOW() - INTERVAL '2 days'),

  (gen_random_uuid(), '22220001-0000-0000-0000-000000000003', 'course',
   'Lê Văn Hùng',
   'Có thông báo mới trong môn Cấu trúc Dữ liệu & Giải thuật.',
   TRUE, '/courses/cccc0001-0000-0000-0000-000000000003',
   NOW() - INTERVAL '8 days'),

  (gen_random_uuid(), '22220001-0000-0000-0000-000000000001', 'system',
   'Hệ thống',
   'Chào mừng bạn đến với myIU Portal! Khám phá các tính năng mới trong học kỳ này.',
   TRUE, '/home',
   NOW() - INTERVAL '15 days'),

  (gen_random_uuid(), '22220001-0000-0000-0000-000000000005', 'grade',
   'Nguyễn Thị Mai',
   'Điểm môn Nhập môn Lập trình của bạn đã được cập nhật. Điểm tổng kết: 7.0',
   FALSE, '/courses/cccc0001-0000-0000-0000-000000000002/grades',
   NOW() - INTERVAL '1 day'),

  (gen_random_uuid(), '22220001-0000-0000-0000-000000000004', 'course',
   'Trần Đức Thịnh',
   'Đồ án giữa kỳ môn Cơ sở Dữ liệu đã được đăng. Deadline: 2 tuần nữa.',
   FALSE, '/courses/cccc0001-0000-0000-0000-000000000004',
   NOW() - INTERVAL '4 days')

ON CONFLICT (id) DO NOTHING;

-- ── Support Tickets (2 samples) ────────────────────────────────

INSERT INTO support_tickets (id, submitter_id, submitter_name, submitter_email, service, need, description, status, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   '22220001-0000-0000-0000-000000000001',
   'Nguyễn Văn An',
   'nguyen.van.a@student.iu.edu.vn',
   'Học vụ',
   'Xem lại điểm',
   'Em muốn yêu cầu xem lại điểm kiểm tra giữa kỳ môn Giải tích I (MATH101). Theo em thấy điểm chưa đúng với bài làm của em.',
   'open',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  (gen_random_uuid(),
   '22220001-0000-0000-0000-000000000006',
   'Vũ Thị Hoa',
   'vu.thi.h@student.iu.edu.vn',
   'Kỹ thuật',
   'Lỗi đăng nhập',
   'Em không thể đăng nhập vào hệ thống myIU Portal bằng tài khoản Microsoft. Sau khi xác thực Microsoft thì bị chuyển về trang lỗi "not_provisioned". Em đã liên hệ phòng CNTT nhưng chưa được phản hồi.',
   'in_progress',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- ── Form Templates (2 templates) ──────────────────────────────

INSERT INTO form_templates (id, title, description, file_type, category, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   'Đơn xin học bổng',
   'Mẫu đơn đăng ký học bổng dành cho sinh viên có thành tích học tập xuất sắc và hoàn cảnh khó khăn. '
   || 'Điền đầy đủ thông tin và nộp kèm bảng điểm xác nhận.',
   'pdf', 'academic', 1, TRUE,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

  (gen_random_uuid(),
   'Đơn phúc khảo điểm',
   'Mẫu đơn yêu cầu phúc khảo bài thi / kiểm tra. '
   || 'Sinh viên cần nộp đơn trong vòng 10 ngày kể từ khi có kết quả chính thức.',
   'pdf', 'academic', 2, TRUE,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days')

ON CONFLICT (id) DO NOTHING;
