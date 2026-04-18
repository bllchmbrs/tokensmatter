CREATE TABLE IF NOT EXISTS comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL,
  model TEXT NOT NULL,
  request_tokens INTEGER NOT NULL,
  request_cost REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_comparisons_submission_model
ON comparisons(submission_id, model);
