-- ── Support Tickets ───────────────────────────────────────────
CREATE TABLE support_tickets (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id     UUID        NOT NULL REFERENCES users(id),
    submitter_name   VARCHAR(255),
    submitter_email  VARCHAR(255),
    service          VARCHAR(100) NOT NULL,
    need             VARCHAR(100) NOT NULL,
    description      TEXT        NOT NULL,
    attachment_url   TEXT,
    status           VARCHAR(20) NOT NULL DEFAULT 'open',  -- open|in_progress|resolved|closed
    response         TEXT,
    resolved_by      VARCHAR(255),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_submitter ON support_tickets(submitter_id);
CREATE INDEX idx_support_tickets_status    ON support_tickets(status);
