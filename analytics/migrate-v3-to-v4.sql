-- Portfolio Analytics V4: run once in Cloudflare D1 "portfolio-analytics".
-- Preserve all prior visit records; do NOT DROP the existing table.
-- Cloudflare D1 console: run one statement at a time.
ALTER TABLE portfolio_visits ADD COLUMN visitor_type TEXT;
ALTER TABLE portfolio_visits ADD COLUMN source_type TEXT;
ALTER TABLE portfolio_visits ADD COLUMN source_host TEXT;
ALTER TABLE portfolio_visits ADD COLUMN device_type TEXT;
ALTER TABLE portfolio_visits ADD COLUMN browser_name TEXT;
CREATE INDEX IF NOT EXISTS idx_portfolio_visits_visited_at ON portfolio_visits (visited_at);
CREATE TABLE IF NOT EXISTS portfolio_events (event_id TEXT PRIMARY KEY, event_date TEXT NOT NULL, target_key TEXT NOT NULL, target_group TEXT NOT NULL, occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_portfolio_events_date ON portfolio_events (event_date);
CREATE INDEX IF NOT EXISTS idx_portfolio_events_target ON portfolio_events (target_key);
