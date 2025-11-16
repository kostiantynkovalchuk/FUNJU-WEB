-- ============================================
-- ENABLE RLS PROPERLY (Run this when ready)
-- ============================================
-- This creates permissive policies that work with Supabase's service role

-- Step 1: Enable RLS
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Step 2: Create permissive policies (allow service_role to bypass RLS)
-- For UGC Submissions
CREATE POLICY "enable_insert_for_all_users"
ON ugc_submissions
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "enable_read_approved_for_all"
ON ugc_submissions
AS PERMISSIVE
FOR SELECT
TO public
USING (status = 'approved');

-- For Event Registrations
CREATE POLICY "enable_insert_for_all_users"
ON event_registrations
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- Step 3: Grant necessary permissions
GRANT INSERT ON ugc_submissions TO anon;
GRANT INSERT ON ugc_submissions TO authenticated;
GRANT SELECT ON ugc_submissions TO anon;
GRANT SELECT ON ugc_submissions TO authenticated;

GRANT INSERT ON event_registrations TO anon;
GRANT INSERT ON event_registrations TO authenticated;

-- Step 4: Verify
SELECT '✅ RLS enabled with permissive policies' as status;
