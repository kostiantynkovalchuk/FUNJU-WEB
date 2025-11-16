-- ============================================
-- SIMPLE RLS FIX - Run this in Supabase SQL Editor
-- ============================================
-- This disables all existing policies and creates fresh ones

-- ============================================
-- 1. DISABLE RLS TEMPORARILY TO CLEAN UP
-- ============================================
ALTER TABLE ugc_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES
-- ============================================

-- Drop UGC policies (all possible names)
DROP POLICY IF EXISTS "Allow public insert" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow public read approved" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow authenticated read all" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow authenticated update" ON ugc_submissions;
DROP POLICY IF EXISTS "ugc_allow_anon_insert" ON ugc_submissions;
DROP POLICY IF EXISTS "ugc_allow_anon_read_approved" ON ugc_submissions;
DROP POLICY IF EXISTS "ugc_allow_auth_read_all" ON ugc_submissions;
DROP POLICY IF EXISTS "ugc_allow_auth_update" ON ugc_submissions;

-- Drop Event policies (all possible names)
DROP POLICY IF EXISTS "Allow public insert" ON event_registrations;
DROP POLICY IF EXISTS "Allow authenticated read all" ON event_registrations;
DROP POLICY IF EXISTS "Allow authenticated update" ON event_registrations;
DROP POLICY IF EXISTS "event_allow_anon_insert" ON event_registrations;
DROP POLICY IF EXISTS "event_allow_auth_read_all" ON event_registrations;
DROP POLICY IF EXISTS "event_allow_auth_update" ON event_registrations;

-- ============================================
-- 3. RE-ENABLE RLS
-- ============================================
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE FRESH POLICIES (UGC SUBMISSIONS)
-- ============================================

-- Allow EVERYONE (anon + authenticated) to INSERT
CREATE POLICY "ugc_public_insert"
ON ugc_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow EVERYONE to SELECT only approved
CREATE POLICY "ugc_public_select_approved"
ON ugc_submissions
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Allow authenticated users to SELECT ALL
CREATE POLICY "ugc_auth_select_all"
ON ugc_submissions
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to UPDATE
CREATE POLICY "ugc_auth_update"
ON ugc_submissions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE
CREATE POLICY "ugc_auth_delete"
ON ugc_submissions
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 5. CREATE FRESH POLICIES (EVENT REGISTRATIONS)
-- ============================================

-- Allow EVERYONE (anon + authenticated) to INSERT
CREATE POLICY "event_public_insert"
ON event_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to SELECT ALL
CREATE POLICY "event_auth_select_all"
ON event_registrations
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to UPDATE
CREATE POLICY "event_auth_update"
ON event_registrations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE
CREATE POLICY "event_auth_delete"
ON event_registrations
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 6. VERIFY POLICIES
-- ============================================

SELECT '✅ CHECKING UGC_SUBMISSIONS POLICIES:' as status;
SELECT
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ugc_submissions'
ORDER BY policyname;

SELECT '✅ CHECKING EVENT_REGISTRATIONS POLICIES:' as status;
SELECT
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'event_registrations'
ORDER BY policyname;

SELECT '🎉 RLS Policies Fixed! You should see 5 policies for ugc_submissions and 4 policies for event_registrations above.' as message;
