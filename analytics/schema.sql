-- Cloudflare D1 (SQLite) schema for the portfolio visit counter.
-- Execute these statements in D1 Console (database: portfolio-analytics).
-- Application intentionally does not store names, emails, or IP addresses.

CREATE TABLE IF NOT EXISTS portfolio_visits (
  visit_id TEXT NOT NULL PRIMARY KEY,
  visit_date TEXT NOT NULL,
  visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_visits_date
  ON portfolio_visits (visit_date);

-- Example administrative checks:
-- SELECT COUNT(*) AS total_visits FROM portfolio_visits;
-- SELECT visit_date, COUNT(*) AS visits
-- FROM portfolio_visits
-- GROUP BY visit_date
-- ORDER BY visit_date DESC;
