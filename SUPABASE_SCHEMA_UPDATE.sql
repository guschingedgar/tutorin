-- ============================================
-- SUPABASE SCHEMA UPDATE FOR AUTHENTICATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor to enable authentication
-- ============================================

-- Step 1: Add user_id column to link signups table with auth.users
ALTER TABLE signups
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signups_user_id ON signups(user_id);

-- Step 3: Update RLS policies to allow users to read their own profile
-- (The existing "Allow public signups" policy should already allow inserts)

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON signups;
CREATE POLICY "Users can read own profile" ON signups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid()::text = user_id::text);

-- Step 4: Optional - Migrate existing records (if any) to link by email
-- This is a one-time migration for existing signups without user_id
-- UPDATE signups s
-- SET user_id = au.id
-- FROM auth.users au
-- WHERE s.email = au.email AND s.user_id IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running, verify the schema:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'signups'
-- ORDER BY ordinal_position;


