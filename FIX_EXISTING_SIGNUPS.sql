-- ============================================
-- FIX EXISTING BROKEN SIGNUPS
-- ============================================
-- This script links existing signups records to auth.users by email
-- Use this if you have signups where user_id is NULL or incorrect
-- ============================================

-- Step 1: Check current state
-- See which signups are missing user_id
SELECT 
  s.id,
  s.email,
  s.user_id as current_user_id,
  au.id as auth_user_id,
  CASE 
    WHEN s.user_id IS NULL THEN 'MISSING'
    WHEN s.user_id != au.id THEN 'MISMATCH'
    ELSE 'OK'
  END as status
FROM signups s
LEFT JOIN auth.users au ON s.email = au.email
ORDER BY s.created_at DESC;

-- Step 2: Update signups to link with auth.users by email
-- This will set user_id for signups that have a matching email in auth.users
UPDATE signups s
SET user_id = au.id
FROM auth.users au
WHERE s.email = au.email 
  AND (s.user_id IS NULL OR s.user_id != au.id);

-- Step 3: Verify the fix
-- Check that all signups now have correct user_id
SELECT 
  s.id,
  s.email,
  s.user_id,
  au.id as auth_user_id,
  CASE 
    WHEN s.user_id = au.id THEN '✅ LINKED'
    ELSE '❌ STILL BROKEN'
  END as status
FROM signups s
LEFT JOIN auth.users au ON s.email = au.email
ORDER BY s.created_at DESC;

-- ============================================
-- CLEANUP: Delete orphaned signups (optional)
-- ============================================
-- Uncomment to delete signups that don't have a matching auth user
-- WARNING: This will permanently delete data!
-- 
-- DELETE FROM signups
-- WHERE user_id IS NULL 
--   AND NOT EXISTS (
--     SELECT 1 FROM auth.users WHERE email = signups.email
--   );


