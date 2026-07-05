-- ── Course Schedules ─────────────────────────────────────────────────────────
CREATE TABLE course_schedules (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week VARCHAR(3)  NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    room        VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_dow   CHECK (day_of_week IN ('MON','TUE','WED','THU','FRI','SAT')),
    CONSTRAINT chk_time  CHECK (end_time > start_time)
);

CREATE INDEX idx_course_schedules_course ON course_schedules(course_id);
