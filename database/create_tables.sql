-- ============================================
-- FUNJU DATABASE TABLES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================
-- 1. UGC SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ugc_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
    content_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ugc_status ON ugc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ugc_created ON ugc_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ugc_email ON ugc_submissions(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (users can submit)
CREATE POLICY "Allow public insert" ON ugc_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow public to read only approved submissions
CREATE POLICY "Allow public read approved" ON ugc_submissions
    FOR SELECT TO anon
    USING (status = 'approved');

-- Allow authenticated users (admin) to read all
CREATE POLICY "Allow authenticated read all" ON ugc_submissions
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users (admin) to update
CREATE POLICY "Allow authenticated update" ON ugc_submissions
    FOR UPDATE TO authenticated
    USING (true);

-- ============================================
-- 2. EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age_range TEXT NOT NULL,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    notes TEXT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_created ON event_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_email ON event_registrations(email);

-- Enable Row Level Security (RLS)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (users can register)
CREATE POLICY "Allow public insert" ON event_registrations
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users (admin) to read all
CREATE POLICY "Allow authenticated read all" ON event_registrations
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users (admin) to update
CREATE POLICY "Allow authenticated update" ON event_registrations
    FOR UPDATE TO authenticated
    USING (true);

-- ============================================
-- 3. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to ugc_submissions
CREATE TRIGGER update_ugc_submissions_updated_at
    BEFORE UPDATE ON ugc_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. OPTIONAL: CREATE VIEWS FOR ANALYTICS
-- ============================================

-- View: UGC submissions by platform
CREATE OR REPLACE VIEW ugc_by_platform AS
SELECT
    platform,
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM ugc_submissions
GROUP BY platform, status;

-- View: Event registrations summary
CREATE OR REPLACE VIEW event_registrations_summary AS
SELECT
    event_id,
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE attended = true) as attended_count,
    COUNT(*) FILTER (WHERE marketing_consent = true) as marketing_consent_count,
    MIN(created_at) as first_registration,
    MAX(created_at) as last_registration
FROM event_registrations
GROUP BY event_id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, tables were created successfully!
SELECT 'Tables created successfully! 🎉' as message;
