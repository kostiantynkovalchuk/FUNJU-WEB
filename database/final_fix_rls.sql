-- ============================================
-- FINAL FIX - Target PUBLIC role explicitly
-- ============================================
-- The issue might be that policies need to target 'public' role

-- Step 1: Disable RLS
ALTER TABLE ugc_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'ugc_submissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON ugc_submissions', r.policyname);
    END LOOP;

    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_registrations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON event_registrations', r.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for PUBLIC role (this is what anon users use)
CREATE POLICY "public_insert_ugc"
ON ugc_submissions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "public_select_approved_ugc"
ON ugc_submissions
FOR SELECT
TO public
USING (status = 'approved');

CREATE POLICY "public_insert_event"
ON event_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Step 5: Also create policies for authenticated and anon explicitly
CREATE POLICY "anon_insert_ugc"
ON ugc_submissions
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_insert_ugc"
ON ugc_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "anon_insert_event"
ON event_registrations
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "authenticated_insert_event"
ON event_registrations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 6: Add all CRUD for authenticated users
CREATE POLICY "authenticated_all_ugc"
ON ugc_submissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_all_event"
ON event_registrations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 7: Check current user role
SELECT
    current_user as current_user,
    session_user as session_user,
    current_role as current_role;

-- Step 8: Verify policies
SELECT '✅ POLICIES CREATED:' as status;
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('ugc_submissions', 'event_registrations')
ORDER BY tablename, policyname;

SELECT '🎉 Try the form again!' as message;
