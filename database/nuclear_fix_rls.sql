-- ============================================
-- NUCLEAR OPTION - Complete RLS Reset
-- ============================================
-- Run this in Supabase SQL Editor if nothing else works

-- Step 1: Completely disable RLS
ALTER TABLE ugc_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies using DO block to catch any edge cases
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on ugc_submissions
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ugc_submissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON ugc_submissions', r.policyname);
    END LOOP;

    -- Drop all policies on event_registrations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_registrations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON event_registrations', r.policyname);
    END LOOP;
END $$;

-- Step 3: Verify no policies exist
SELECT 'Checking for remaining policies...' as status;
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('ugc_submissions', 'event_registrations');

-- Step 4: Re-enable RLS
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create ONE simple policy for INSERT on each table
-- UGC: Allow anyone to insert
CREATE POLICY "allow_all_insert_ugc"
ON ugc_submissions
FOR INSERT
WITH CHECK (true);

-- Event: Allow anyone to insert
CREATE POLICY "allow_all_insert_event"
ON event_registrations
FOR INSERT
WITH CHECK (true);

-- Step 6: Add SELECT policy for UGC (read approved only)
CREATE POLICY "allow_read_approved_ugc"
ON ugc_submissions
FOR SELECT
USING (status = 'approved');

-- Step 7: Verify new policies
SELECT '✅ NEW POLICIES CREATED:' as status;
SELECT
    tablename,
    policyname,
    cmd as command,
    roles
FROM pg_policies
WHERE tablename IN ('ugc_submissions', 'event_registrations')
ORDER BY tablename, policyname;

SELECT '🎉 Done! Try the debug form again.' as message;
