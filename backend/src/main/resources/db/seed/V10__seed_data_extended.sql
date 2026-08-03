-- ============================================================
-- V10: Extended seed data — timetable, attendance, submissions,
--      form submissions, social posts, additional grades
-- Local & Dev only
-- ============================================================

-- ── Course Schedules (timetable) ─────────────────────────────
-- 2 sessions per course (lecture + lab/tutorial)

INSERT INTO course_schedules (id, course_id, day_of_week, start_time, end_time, room, created_at)
VALUES
  -- MATH101
  ('sc000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', 'MON', '07:30', '10:15', 'A1.101', NOW()),
  ('sc000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', 'THU', '13:00', '15:45', 'A1.101', NOW()),
  -- CS101
  ('sc000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000002', 'TUE', '07:30', '10:15', 'B2.301', NOW()),
  ('sc000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000002', 'FRI', '13:00', '15:45', 'B2.Lab1', NOW()),
  -- CS201
  ('sc000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000003', 'WED', '07:30', '10:15', 'A2.201', NOW()),
  ('sc000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000003', 'SAT', '07:30', '10:15', 'A2.Lab2', NOW()),
  -- CS301
  ('sc000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000004', 'TUE', '13:00', '15:45', 'C1.101', NOW()),
  ('sc000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000004', 'FRI', '07:30', '10:15', 'C1.Lab1', NOW()),
  -- MATH201
  ('sc000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000005', 'WED', '13:00', '15:45', 'A1.201', NOW()),
  ('sc000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000005', 'SAT', '13:00', '15:45', 'A1.201', NOW())
ON CONFLICT (id) DO NOTHING;

-- ── Assignment Posts with fixed IDs (for submissions) ─────────

INSERT INTO course_posts (id, course_id, author_id, author_name, title, body, type, is_published, due_date, created_at, updated_at)
VALUES
  ('pp000001-0000-0000-0000-000000000001',
   'cccc0001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001', 'Trần Đức Thịnh',
   'Bài kiểm tra 15 phút – Đạo hàm',
   'Bài kiểm tra 15 phút tại lớp về đạo hàm và quy tắc tính đạo hàm. Không sử dụng tài liệu.',
   'assignment', TRUE, NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

  ('pp000001-0000-0000-0000-000000000002',
   'cccc0001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002', 'Nguyễn Thị Mai',
   'Bài thực hành: Vòng lặp và mảng Python',
   'Viết các hàm Python xử lý mảng số nguyên: tìm min, max, tính tổng, đảo ngược. Nộp file .py.',
   'assignment', TRUE, NOW() + INTERVAL '3 days',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

  ('pp000001-0000-0000-0000-000000000003',
   'cccc0001-0000-0000-0000-000000000003',
   '11110001-0000-0000-0000-000000000003', 'Lê Văn Hùng',
   'Bài tập Cây nhị phân tìm kiếm (BST)',
   'Cài đặt BST bằng Java: insert, delete, search, inorder traversal. Viết thêm hàm tính chiều cao cây.',
   'assignment', TRUE, NOW() + INTERVAL '8 days',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ── Assignment Submissions ────────────────────────────────────
-- 5 students submit MATH101 quiz (already past due), 3 submit CS101 lab

INSERT INTO assignment_submissions (id, course_post_id, student_id, student_name, text_content, status, score, feedback, submitted_at, updated_at)
VALUES
  -- MATH101 quiz submissions (graded)
  ('as000001-0000-0000-0000-000000000001',
   'pp000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',
   'f(x) = x³ → f''(x) = 3x². f(x) = sin(x) → f''(x) = cos(x). Quy tắc tích: (uv)'' = u''v + uv''.',
   'GRADED', 9.0, 'Làm tốt, trình bày rõ ràng.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('as000001-0000-0000-0000-000000000002',
   'pp000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',
   'Đạo hàm hàm hợp: (f∘g)'' = f''(g(x))·g''(x). Ví dụ: h(x) = sin(x²) → h''(x) = cos(x²)·2x.',
   'GRADED', 8.5, 'Trình bày đủ ý, cần viết thêm ví dụ cụ thể.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('as000001-0000-0000-0000-000000000003',
   'pp000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường',
   'f(x) = x² + 3x → f''(x) = 2x + 3. f(x) = e^x → f''(x) = e^x.',
   'GRADED', 7.0, 'Cần bổ sung quy tắc dây chuyền.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('as000001-0000-0000-0000-000000000004',
   'pp000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',
   'Đạo hàm cơ bản: (xⁿ)'' = nxⁿ⁻¹. Quy tắc thương: (u/v)'' = (u''v − uv'')/v².',
   'GRADED', 9.5, 'Xuất sắc! Trình bày đầy đủ và chính xác.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('as000001-0000-0000-0000-000000000005',
   'pp000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức',
   'f(x) = ln(x) → f''(x) = 1/x. f(x) = cos(x) → f''(x) = -sin(x).',
   'GRADED', 6.5, 'Thiếu quy tắc tích và dây chuyền.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  -- CS101 lab submissions (submitted, not yet graded)
  ('as000001-0000-0000-0000-000000000006',
   'pp000001-0000-0000-0000-000000000002',
   '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',
   'def find_min(arr): return min(arr)\ndef find_max(arr): return max(arr)\ndef total(arr): return sum(arr)\ndef reverse(arr): return arr[::-1]',
   'SUBMITTED', NULL, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('as000001-0000-0000-0000-000000000007',
   'pp000001-0000-0000-0000-000000000002',
   '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',
   'Đã viết 4 hàm yêu cầu + thêm hàm tính trung bình và đếm số chẵn. Có test cases đầy đủ.',
   'SUBMITTED', NULL, NULL, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

  ('as000001-0000-0000-0000-000000000008',
   'pp000001-0000-0000-0000-000000000002',
   '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường',
   'Hoàn thành bài thực hành, code Python đã test.',
   'LATE', NULL, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (course_post_id, student_id) DO NOTHING;

-- ── Attendance Records ─────────────────────────────────────────
-- 3 sessions for MATH101 and CS101 (Mon/Tue of last 3 weeks)

INSERT INTO attendance_records (id, course_id, student_id, student_name, date, status, marked_by, created_at)
VALUES
  -- MATH101 – session 2026-07-21 (MON)
  ('ar000001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  '2026-07-21', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  '2026-07-21', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000003', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', '2026-07-21', 'ABSENT',  '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  '2026-07-21', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', '2026-07-21', 'LATE',    '11110001-0000-0000-0000-000000000001', NOW()),

  -- MATH101 – session 2026-07-28 (MON)
  ('ar000001-0000-0000-0000-000000000006', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  '2026-07-28', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  '2026-07-28', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', '2026-07-28', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000009', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  '2026-07-28', 'EXCUSED', '11110001-0000-0000-0000-000000000001', NOW()),
  ('ar000001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000001', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', '2026-07-28', 'PRESENT', '11110001-0000-0000-0000-000000000001', NOW()),

  -- CS101 – session 2026-07-22 (TUE)
  ('ar000001-0000-0000-0000-000000000011', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  '2026-07-22', 'PRESENT', '11110001-0000-0000-0000-000000000002', NOW()),
  ('ar000001-0000-0000-0000-000000000012', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  '2026-07-22', 'PRESENT', '11110001-0000-0000-0000-000000000002', NOW()),
  ('ar000001-0000-0000-0000-000000000013', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', '2026-07-22', 'PRESENT', '11110001-0000-0000-0000-000000000002', NOW()),
  ('ar000001-0000-0000-0000-000000000014', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  '2026-07-22', 'ABSENT',  '11110001-0000-0000-0000-000000000002', NOW()),
  ('ar000001-0000-0000-0000-000000000015', 'cccc0001-0000-0000-0000-000000000002', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', '2026-07-22', 'LATE',    '11110001-0000-0000-0000-000000000002', NOW())
ON CONFLICT (course_id, student_id, date) DO NOTHING;

-- ── Form Submissions ──────────────────────────────────────────

INSERT INTO form_submissions (id, submitter_id, submitter_name, submitter_email, form_title, status, created_at, updated_at)
VALUES
  ('fs000001-0000-0000-0000-000000000001',
   '22220001-0000-0000-0000-000000000003',
   'Lê Hoàng Cường', 'le.hoang.c@student.iu.edu.vn',
   'Đơn phúc khảo điểm – MATH101',
   'pending',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  ('fs000001-0000-0000-0000-000000000002',
   '22220001-0000-0000-0000-000000000008',
   'Bùi Thị Lan', 'bui.thi.l@student.iu.edu.vn',
   'Đơn xin học bổng học kỳ 2024-2025',
   'approved',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ── Additional Course Grades (CS301, MATH201) ─────────────────

INSERT INTO course_grades (id, course_id, student_id, student_name, quiz, exercise, lab, midterm, project, final_score, graded_by, created_at, updated_at)
VALUES
  -- CS301 — students 1-5
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000001', 'Nguyễn Văn An',  8.0, NULL, 8.5, 8.0, 9.0, 8.4, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000002', 'Trần Thị Bình',  9.0, NULL, 9.0, 8.5, 9.5, 9.0, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000003', 'Lê Hoàng Cường', 6.0, NULL, 7.0, 6.5, 7.0, 6.6, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000004', 'Phạm Thị Dung',  7.5, NULL, 8.0, 7.5, 8.0, 7.8, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000004', '22220001-0000-0000-0000-000000000005', 'Hoàng Minh Đức', 7.0, NULL, 6.5, 7.0, 7.5, 7.0, '11110001-0000-0000-0000-000000000001', NOW(), NOW()),

  -- MATH201 — students 6-10
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000006', 'Vũ Thị Hoa',      8.5, 9.0, NULL, 8.0, NULL, 8.4, '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000007', 'Đặng Văn Khánh',  7.0, 7.5, NULL, 7.0, NULL, 7.2, '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000008', 'Bùi Thị Lan',     9.0, 8.5, NULL, 9.0, NULL, 8.9, '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000009', 'Ngô Đức Mạnh',    6.5, 7.0, NULL, 6.0, NULL, 6.5, '11110001-0000-0000-0000-000000000002', NOW(), NOW()),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000005', '22220001-0000-0000-0000-000000000010', 'Phan Thị Ngọc',   8.0, 8.0, NULL, 7.5, NULL, 7.9, '11110001-0000-0000-0000-000000000002', NOW(), NOW())
ON CONFLICT (course_id, student_id) DO NOTHING;

-- ── Social Posts (home feed) ──────────────────────────────────

INSERT INTO posts (id, creator_id, caption, created_at, updated_at)
VALUES
  ('fp000001-0000-0000-0000-000000000001',
   '11110001-0000-0000-0000-000000000001',
   'Nhắc nhở: Deadline bài tập Giải tích I – Giới hạn và liên tục là tuần sau. Các em chú ý ôn lại lý thuyết về giới hạn một phía và giới hạn vô cực trước khi làm bài. Chúc các em học tốt! 📚',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('fp000001-0000-0000-0000-000000000002',
   '11110001-0000-0000-0000-000000000002',
   'Buổi lab Python hôm nay rất sôi nổi! Nhiều bạn đã làm được bài khá nhanh. Nhớ hoàn thiện bài thực hành và nộp trước deadline nhé. Các em có thắc mắc cứ email cho cô.',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('fp000001-0000-0000-0000-000000000003',
   '22220001-0000-0000-0000-000000000001',
   'Vừa hoàn thành bài lab Python môn CS101. Cảm giác khi code chạy đúng lần đầu thật tuyệt vời 🎉 Ai đang học môn này thì cố lên nha!',
   NOW() - INTERVAL '22 hours', NOW() - INTERVAL '22 hours'),

  ('fp000001-0000-0000-0000-000000000004',
   '11110001-0000-0000-0000-000000000003',
   'Tài liệu môn Cấu trúc Dữ liệu & Giải thuật đã được upload lên hệ thống. Bài tập BST sẽ giúp các em hiểu sâu hơn về đệ quy và cấu trúc cây. Hẹn gặp các em trong buổi thực hành thứ 7!',
   NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- ── Post Tags ──────────────────────────────────────────────────

INSERT INTO post_tags (post_id, tag) VALUES
  ('fp000001-0000-0000-0000-000000000001', 'giaitich'),
  ('fp000001-0000-0000-0000-000000000001', 'deadline'),
  ('fp000001-0000-0000-0000-000000000002', 'python'),
  ('fp000001-0000-0000-0000-000000000002', 'cs101'),
  ('fp000001-0000-0000-0000-000000000003', 'python'),
  ('fp000001-0000-0000-0000-000000000003', 'student'),
  ('fp000001-0000-0000-0000-000000000004', 'ctdl'),
  ('fp000001-0000-0000-0000-000000000004', 'bst')
ON CONFLICT DO NOTHING;
