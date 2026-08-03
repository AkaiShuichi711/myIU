CREATE TABLE assignment_submissions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_post_id UUID         NOT NULL,
    student_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name   VARCHAR(255) NOT NULL,
    file_url       TEXT,
    file_id        TEXT,
    file_name      TEXT,
    text_content   TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED',
    score          NUMERIC(5,2),
    feedback       TEXT,
    submitted_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_submission_post_student UNIQUE (course_post_id, student_id)
);

CREATE INDEX idx_submission_post   ON assignment_submissions(course_post_id);
CREATE INDEX idx_submission_student ON assignment_submissions(student_id);
