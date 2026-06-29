-- ── Login Sessions ────────────────────────────────────────────────────────────
CREATE TABLE login_sessions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address       VARCHAR(45),
    country          VARCHAR(100),
    city             VARCHAR(100),
    country_code     VARCHAR(10),
    browser          VARCHAR(100),
    browser_version  VARCHAR(50),
    os               VARCHAR(100),
    device_type      VARCHAR(20)  NOT NULL DEFAULT 'desktop',
    raw_user_agent   TEXT,
    is_revoked       BOOLEAN      NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_active      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_created ON login_sessions(created_at DESC);
