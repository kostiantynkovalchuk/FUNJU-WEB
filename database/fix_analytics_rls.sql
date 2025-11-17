-- Disable RLS on analytics_events table
-- (Safe since analytics.html is password-protected)
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
