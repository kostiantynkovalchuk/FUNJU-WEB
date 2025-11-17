-- Allow anonymous users to read analytics_events
-- (For the analytics dashboard)
CREATE POLICY "Allow anonymous reads" ON analytics_events
  FOR SELECT TO anon
  USING (true);
