-- ============================================
-- CHECK CURRENT STATE OF POLICIES
-- ============================================
-- Run this to see what's currently configured

-- Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('ugc_submissions', 'event_registrations');

-- Check all current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('ugc_submissions', 'event_registrations')
ORDER BY tablename, policyname;

-- Check table ownership
SELECT
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN ('ugc_submissions', 'event_registrations');

-- Test if we can see the tables
SELECT 'ugc_submissions count:' as info, COUNT(*) as count FROM ugc_submissions;
SELECT 'event_registrations count:' as info, COUNT(*) as count FROM event_registrations;
