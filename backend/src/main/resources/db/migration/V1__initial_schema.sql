-- ============================================================
-- myIU Portal – Initial PostgreSQL Schema
-- Migrated from Appwrite (13 collections → 13 tables)
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)        NOT NULL,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255),                    -- BCrypt hash; NULL for SSO-only accounts
    image_url   TEXT,
    bio         TEXT,
    is_private  BOOLEAN             NOT NULL DEFAULT FALSE,
    auth_provider VARCHAR(50)       NOT NULL DEFAULT 'local',  -- 'local' | 'microsoft'
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ         NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- ── Posts ────────────────────────────────────────────────────
CREATE TABLE posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caption     TEXT,
    location    VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE post_tags (
    post_id UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag     VARCHAR(100) NOT NULL
);
CREATE INDEX idx_post_tags ON post_tags(tag);

CREATE TABLE post_media (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    file_id    UUID,                             -- FK to stored_files
    url        TEXT         NOT NULL,
    media_type VARCHAR(20)  NOT NULL DEFAULT 'image',  -- image|video|pdf|word|excel|ppt|file
    sort_order SMALLINT     NOT NULL DEFAULT 0
);

-- ── Saves ─────────────────────────────────────────────────────
CREATE TABLE saves (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id)
);

-- ── Comments ──────────────────────────────────────────────────
CREATE TABLE comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id      UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name  VARCHAR(255) NOT NULL,
    author_image TEXT,
    body         TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE comment_tagged_users (
    comment_id UUID        NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    username   VARCHAR(100) NOT NULL
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,   -- like|comment|mention|tag|grade|course|system|form_approved|form_rejected|form_pending
    actor_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
    actor_name  VARCHAR(255),
    post_id     UUID        REFERENCES posts(id) ON DELETE SET NULL,
    comment_id  UUID        REFERENCES comments(id) ON DELETE SET NULL,
    message     TEXT        NOT NULL,
    read        BOOLEAN     NOT NULL DEFAULT FALSE,
    link_to     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ── Blocks ────────────────────────────────────────────────────
CREATE TABLE blocks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_name VARCHAR(255),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (blocker_id, blocked_id)
);

-- ── Courses ───────────────────────────────────────────────────
CREATE TABLE courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50)  NOT NULL,
    semester    VARCHAR(100),
    description TEXT,
    cover_color VARCHAR(20)  NOT NULL DEFAULT '#0B2275',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    creator_id  UUID         NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Student enrollment in courses
CREATE TABLE course_enrollments (
    course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, student_id)
);

-- ── Course Groups ─────────────────────────────────────────────
CREATE TABLE course_groups (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id     UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id   UUID         NOT NULL REFERENCES users(id),
    lecturer_name VARCHAR(255),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Group Members ─────────────────────────────────────────────
CREATE TABLE group_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id     UUID         NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
    course_id    UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (group_id, student_id)
);

-- ── Course Posts (announcements/materials/assignments) ─────────
CREATE TABLE course_posts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id        UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    group_id         UUID         REFERENCES course_groups(id) ON DELETE SET NULL,
    author_id        UUID         NOT NULL REFERENCES users(id),
    author_name      VARCHAR(255),
    title            VARCHAR(500) NOT NULL,
    body             TEXT,
    type             VARCHAR(50)  NOT NULL DEFAULT 'announcement',  -- announcement|material|assignment
    is_published     BOOLEAN      NOT NULL DEFAULT TRUE,
    due_date         TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE course_post_attachments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_post_id UUID NOT NULL REFERENCES course_posts(id) ON DELETE CASCADE,
    file_id       UUID,
    url           TEXT NOT NULL,
    file_name     VARCHAR(500)
);

-- ── Form Templates ────────────────────────────────────────────
CREATE TABLE form_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    file_id     UUID,
    file_url    TEXT,
    file_name   VARCHAR(500),
    file_type   VARCHAR(20)  NOT NULL DEFAULT 'pdf',   -- pdf|docx|xlsx|doc|ppt|other
    category    VARCHAR(50)  NOT NULL DEFAULT 'academic', -- academic|finance|administrative|other
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by  UUID         REFERENCES users(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Form Submissions ──────────────────────────────────────────
CREATE TABLE form_submissions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id      UUID         NOT NULL REFERENCES users(id),
    submitter_name    VARCHAR(255),
    submitter_email   VARCHAR(255),
    form_template_id  UUID         REFERENCES form_templates(id) ON DELETE SET NULL,
    form_title        VARCHAR(500),
    uploaded_file_id  UUID,
    uploaded_file_url TEXT,
    approver_email    VARCHAR(255),
    approver_name     VARCHAR(255),
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending|approved|rejected
    rejection_reason  TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_form_submissions_user ON form_submissions(submitter_id);

-- ── Course Grades ─────────────────────────────────────────────
CREATE TABLE course_grades (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    quiz         NUMERIC(5,2),
    exercise     NUMERIC(5,2),
    lab          NUMERIC(5,2),
    midterm      NUMERIC(5,2),
    project      NUMERIC(5,2),
    final_score  NUMERIC(5,2),
    graded_by    UUID         REFERENCES users(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (course_id, student_id)
);

-- ── Stored Files (replaces Appwrite Storage) ─────────────────
CREATE TABLE stored_files (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(500) NOT NULL,
    stored_name  VARCHAR(500) NOT NULL,
    content_type VARCHAR(200),
    size_bytes   BIGINT,
    uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_posts_creator   ON posts(creator_id, created_at DESC);
CREATE INDEX idx_saves_user      ON saves(user_id);
CREATE INDEX idx_comments_post   ON comments(post_id, created_at);
CREATE INDEX idx_courses_creator ON courses(creator_id);
