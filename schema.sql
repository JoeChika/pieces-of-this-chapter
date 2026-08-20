CREATE TABLE IF NOT EXISTS guestbook_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  relation VARCHAR(80) NOT NULL,
  message VARCHAR(500) NOT NULL,
  mood VARCHAR(16) NOT NULL DEFAULT '💌',
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guestbook_messages_created_at_idx
  ON guestbook_messages (created_at DESC);
