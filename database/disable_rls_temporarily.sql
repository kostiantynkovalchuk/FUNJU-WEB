-- ============================================
-- TEMPORARY: DISABLE RLS COMPLETELY
-- ============================================
-- This will allow us to test if the form works without RLS
-- We'll re-enable it properly once we confirm the form works

-- Disable RLS on both tables
ALTER TABLE ugc_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('ugc_submissions', 'event_registrations');

SELECT '⚠️ RLS is now DISABLED. This is temporary for testing.' as warning;
SELECT 'Try the debug form now - it should work!' as message;
