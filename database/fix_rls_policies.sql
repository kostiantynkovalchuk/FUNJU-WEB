-- ============================================
-- FIX RLS POLICIES - Run this in Supabase SQL Editor
-- ============================================
-- The issue: Policy names were duplicated between tables
-- This script fixes the RLS policies with unique names

-- ============================================
-- 1. FIX UGC SUBMISSIONS POLICIES
-- ============================================

-- Drop old policies with duplicate names
DROP POLICY IF EXISTS "Allow public insert" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow public read approved" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow authenticated read all" ON ugc_submissions;
DROP POLICY IF EXISTS "Allow authenticated update" ON ugc_submissions;

-- Create new policies with unique names
CREATE POLICY "ugc_allow_anon_insert" ON ugc_submissions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "ugc_allow_anon_read_approved" ON ugc_submissions
    FOR SELECT TO anon, authenticated
    USING (status = 'approved');

CREATE POLICY "ugc_allow_auth_read_all" ON ugc_submissions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "ugc_allow_auth_update" ON ugc_submissions
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 2. FIX EVENT REGISTRATIONS POLICIES
-- ============================================

-- Drop old policies with duplicate names
DROP POLICY IF EXISTS "Allow public insert" ON event_registrations;
DROP POLICY IF EXISTS "Allow authenticated read all" ON event_registrations;
DROP POLICY IF EXISTS "Allow authenticated update" ON event_registrations;

-- Create new policies with unique names
CREATE POLICY "event_allow_anon_insert" ON event_registrations
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "event_allow_auth_read_all" ON event_registrations
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "event_allow_auth_update" ON event_registrations
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 3. VERIFY POLICIES
-- ============================================

-- Check UGC policies
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'ugc_submissions'
ORDER BY policyname;

-- Check Event policies
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'event_registrations'
ORDER BY policyname;

-- Success message
SELECT '✅ RLS Policies Fixed! You should see 4 policies for ugc_submissions and 3 policies for event_registrations above.' as message;
