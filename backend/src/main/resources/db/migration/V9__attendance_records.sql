CREATE TABLE attendance_records (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id   UUID         NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    date         DATE         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PRESENT',
    note         VARCHAR(500),
    marked_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_attendance UNIQUE (course_id, student_id, date)
);

CREATE INDEX idx_attendance_course  ON attendance_records(course_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_date    ON attendance_records(date);
