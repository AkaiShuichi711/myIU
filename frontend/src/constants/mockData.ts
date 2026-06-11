// ── Centralized mock data — replace with real Appwrite data when collections are ready ──

// ── Courses ───────────────────────────────────────────────────────────────────
export const MOCK_COURSES_BASE = [
  { $id: 'mc1', code: 'CS301', name: 'Mạng Máy Tính',     coverColor: '#179BD7', semester: 'HK2 2025-2026', isActive: true  },
  { $id: 'mc2', code: 'SE302', name: 'Kiểm Thử Phần Mềm', coverColor: '#27ae60', semester: 'HK2 2025-2026', isActive: true  },
  { $id: 'mc3', code: 'IT310', name: 'Trí Tuệ Nhân Tạo',  coverColor: '#8e44ad', semester: 'HK2 2025-2026', isActive: true  },
  { $id: 'mc4', code: 'CS201', name: 'Cấu Trúc Dữ Liệu',  coverColor: '#e74c3c', semester: 'HK1 2025-2026', isActive: false },
];

export const MOCK_COURSES_ALL = [
  ...MOCK_COURSES_BASE,
  { $id: 'mc5', code: 'MT205', name: 'Xác Suất Thống Kê',  coverColor: '#f39c12', semester: 'HK1 2025-2026', isActive: false, description: 'Lý thuyết xác suất, phân phối, kiểm định giả thuyết.' },
  { $id: 'mc6', code: 'IS401', name: 'An Toàn Thông Tin',  coverColor: '#16a085', semester: 'HK2 2025-2026', isActive: true,  description: 'Mã hóa, bảo mật mạng, ethical hacking cơ bản.' },
];

export const MOCK_COURSE_MAP: Record<string, any> = {
  mc1: { $id: 'mc1', code: 'CS301', name: 'Mạng Máy Tính',     coverColor: '#179BD7', semester: 'HK2 2025-2026', isActive: true,  description: 'Nghiên cứu giao thức mạng, mô hình OSI/TCP-IP, định tuyến và bảo mật mạng.' },
  mc2: { $id: 'mc2', code: 'SE302', name: 'Kiểm Thử Phần Mềm', coverColor: '#27ae60', semester: 'HK2 2025-2026', isActive: true,  description: 'Các phương pháp kiểm thử: unit test, integration test, automated testing.' },
  mc3: { $id: 'mc3', code: 'IT310', name: 'Trí Tuệ Nhân Tạo',  coverColor: '#8e44ad', semester: 'HK2 2025-2026', isActive: true,  description: 'Giới thiệu về AI, machine learning, neural networks và ứng dụng thực tiễn.' },
  mc4: { $id: 'mc4', code: 'CS201', name: 'Cấu Trúc Dữ Liệu',  coverColor: '#e74c3c', semester: 'HK1 2025-2026', isActive: false, description: 'Array, LinkedList, Stack, Queue, Tree, Graph và các giải thuật cơ bản.' },
};

// ── Course posts / groups / grades fallback ───────────────────────────────────
export const MOCK_POSTS_FALLBACK: any[] = [
  { $id: 'mp1', courseId: '', type: 'announcement', title: 'Lịch thi cuối kỳ HK2 2025-2026',       body: 'Thi vào 09h00 ngày 25/06/2026, phòng B4.01. Hình thức: Trắc nghiệm 60 phút + Tự luận 30 phút.', authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '',           attachmentNames: [],                                    attachmentUrls: [], $createdAt: '2026-06-10T08:00:00.000Z' },
  { $id: 'mp2', courseId: '', type: 'assignment',   title: 'Lab 3: Wireshark Packet Analysis',      body: 'Dùng Wireshark bắt và phân tích gói tin TCP/IP. Viết báo cáo ≥ 5 trang.',                      authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '20/06/2026',  attachmentNames: [],                                    attachmentUrls: [], $createdAt: '2026-06-05T09:00:00.000Z' },
  { $id: 'mp3', courseId: '', type: 'material',     title: 'Slide Ch.5 — Transport Layer',          body: 'Nội dung: TCP/UDP, port numbers, flow control, congestion control.',                             authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '',           attachmentNames: ['CH05_TransportLayer.pdf'],           attachmentUrls: ['#'], $createdAt: '2026-06-03T14:00:00.000Z' },
  { $id: 'mp4', courseId: '', type: 'announcement', title: 'Điểm Lab 2 đã được cập nhật',           body: 'Kết quả Lab 2 đã đăng trên hệ thống. Sinh viên có thắc mắc liên hệ trước 14/06/2026.',         authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '',           attachmentNames: [],                                    attachmentUrls: [], $createdAt: '2026-05-28T11:00:00.000Z' },
  { $id: 'mp5', courseId: '', type: 'material',     title: 'Tài liệu tham khảo — Tanenbaum 5th',   body: 'Computer Networks (5th ed.) — Andrew Tanenbaum.',                                                authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '',           attachmentNames: ['Tanenbaum_ComputerNetworks_5th.pdf'], attachmentUrls: ['#'], $createdAt: '2026-05-15T08:00:00.000Z' },
  { $id: 'mp6', courseId: '', type: 'assignment',   title: 'Project cuối kỳ: Thiết kế mạng LAN',   body: 'Nhóm 3-4 sinh viên thiết kế và mô phỏng mạng LAN. Dùng Cisco Packet Tracer.',                   authorName: 'TS. Trần Quang Khải', groupId: null, dueDate: '22/06/2026',  attachmentNames: ['ProjectRequirements.pdf'],           attachmentUrls: ['#'], $createdAt: '2026-05-01T09:00:00.000Z' },
];

export const MOCK_GROUPS_FALLBACK: any[] = [
  { $id: 'mg1', courseId: '', name: 'Nhóm A', lecturerName: 'TS. Trần Quang Khải', description: 'Thực hành thứ 2, tiết 1-3', $createdAt: '2026-03-01T08:00:00.000Z' },
  { $id: 'mg2', courseId: '', name: 'Nhóm B', lecturerName: 'TS. Trần Quang Khải', description: 'Thực hành thứ 4, tiết 1-3', $createdAt: '2026-03-01T08:00:00.000Z' },
  { $id: 'mg3', courseId: '', name: 'Nhóm C', lecturerName: 'TS. Trần Quang Khải', description: 'Thực hành thứ 6, tiết 7-9', $createdAt: '2026-03-01T08:00:00.000Z' },
];

export const MOCK_STUDENTS = [
  { id: 'ITITIU21001', name: 'Nguyễn Văn An',   scores: { quiz: 9.0, exercise: 8.5, lab: 8.0, midterm: 7.5, project: 9.0, final: 8.0 } },
  { id: 'ITITIU21002', name: 'Trần Thị Bảo',    scores: { quiz: 7.5, exercise: 8.0, lab: 7.0, midterm: 6.5, project: 8.0, final: 7.0 } },
  { id: 'ITITIU21003', name: 'Lê Văn Cường',    scores: { quiz: 10,  exercise: 9.5, lab: 9.5, midterm: 9.0, project: 9.5, final: 9.0 } },
  { id: 'ITITIU21004', name: 'Phạm Thị Duyên',  scores: { quiz: 6.0, exercise: 7.0, lab: 6.5, midterm: 5.5, project: 7.0, final: 6.0 } },
  { id: 'ITITIU21005', name: 'Hoàng Minh Đức',  scores: { quiz: 8.5, exercise: 8.0, lab: 8.5, midterm: 8.0, project: 8.5, final: 8.5 } },
  { id: 'ITITIU21006', name: 'Vũ Thanh Hà',     scores: { quiz: 7.0, exercise: 7.5, lab: 7.0, midterm: 6.0, project: 7.5, final: 6.5 } },
  { id: 'ITITIU21007', name: 'Đặng Quốc Hùng',  scores: { quiz: 8.0, exercise: 8.5, lab: 8.0, midterm: 7.0, project: 8.0, final: 7.5 } },
  { id: 'ITITIU21008', name: 'Bùi Thị Lan',     scores: { quiz: 9.5, exercise: 9.0, lab: 9.0, midterm: 8.5, project: 9.0, final: 8.5 } },
  { id: 'ITITIU21009', name: 'Phan Văn Long',   scores: { quiz: 5.5, exercise: 6.0, lab: 5.5, midterm: 4.5, project: 6.0, final: 5.0 } },
  { id: 'ITITIU21010', name: 'Nguyễn Thị Mai',  scores: { quiz: 8.0, exercise: 7.5, lab: 8.0, midterm: 7.5, project: 8.0, final: 8.0 } },
  { id: 'ITITIU21011', name: 'Trương Minh Nam', scores: { quiz: 6.5, exercise: 7.0, lab: 6.0, midterm: 5.0, project: 7.0, final: 5.5 } },
  { id: 'ITITIU21012', name: 'Lý Thị Oanh',     scores: { quiz: 9.0, exercise: 9.5, lab: 9.0, midterm: 8.5, project: 9.5, final: 9.0 } },
  { id: 'ITITIU21013', name: 'Đỗ Văn Phong',    scores: { quiz: 7.5, exercise: 7.0, lab: 7.5, midterm: 7.0, project: 7.5, final: 7.0 } },
  { id: 'ITITIU21014', name: 'Hồ Thị Quỳnh',   scores: { quiz: 8.5, exercise: 8.0, lab: 8.5, midterm: 8.0, project: 8.0, final: 8.5 } },
  { id: 'ITITIU21015', name: 'Mai Văn Sơn',     scores: { quiz: 4.0, exercise: 5.0, lab: 4.5, midterm: 3.5, project: 5.0, final: 4.0 } },
];

// ── Forms ─────────────────────────────────────────────────────────────────────
export const MOCK_FORMS_STUDENT = [
  { $id: 'hf1', formTitle: 'Đơn xin bảo lưu kết quả học tập', status: 'pending',  $createdAt: '2026-06-08T10:00:00.000Z' },
  { $id: 'hf2', formTitle: 'Đơn xin miễn học phần CS101',      status: 'approved', $createdAt: '2026-06-05T08:00:00.000Z' },
  { $id: 'hf3', formTitle: 'Đơn xin xét học bổng HK2',         status: 'rejected', $createdAt: '2026-06-01T09:00:00.000Z' },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export const MOCK_NOTIFS_HOME = [
  { $id: 'hn1', type: 'form_approved', message: 'Đơn xin miễn học phần của bạn đã được duyệt', read: false, $createdAt: '2026-06-10T09:00:00.000Z', linkTo: '/forms'   },
  { $id: 'hn2', type: 'grade',         message: 'Điểm môn Mạng Máy Tính (CS301) đã được cập nhật',          read: false, $createdAt: '2026-06-10T07:30:00.000Z', linkTo: '/courses' },
  { $id: 'hn3', type: 'course',        message: 'Bạn vừa được đăng ký vào lớp Lập Trình Hướng Đối Tượng',  read: true,  $createdAt: '2026-06-09T15:00:00.000Z', linkTo: '/courses' },
];
