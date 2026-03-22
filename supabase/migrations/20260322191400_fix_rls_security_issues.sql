-- ========================================
-- SECURITY FIX: RLS for capacity tables and profiles data exposure
-- ========================================

-- ========================================
-- ISSUE 1: Add RLS to publishing_capacity and publisher_daily_quota tables
-- ========================================

-- Enable RLS on publishing_capacity table
ALTER TABLE public.publishing_capacity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Publishing capacity admin only" ON public.publishing_capacity;
DROP POLICY IF EXISTS "Publishing capacity public read" ON public.publishing_capacity;

-- Policy: Only admins can view/modify publishing capacity
CREATE POLICY "Publishing capacity admin only"
  ON public.publishing_capacity 
  FOR ALL 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on publisher_daily_quota table
ALTER TABLE public.publisher_daily_quota ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own daily quota" ON public.publisher_daily_quota;
DROP POLICY IF EXISTS "Admin can view all daily quotas" ON public.publisher_daily_quota;

-- Policy: Users can only view their own daily quota
CREATE POLICY "Users can view own daily quota"
  ON public.publisher_daily_quota 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all daily quotas
CREATE POLICY "Admin can view all daily quotas"
  ON public.publisher_daily_quota 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- ISSUE 2: Fix profiles SELECT policy to prevent data exposure
-- ========================================

-- Drop the overly permissive policy that exposes all profiles
DROP POLICY IF EXISTS "Profiles visible to authenticated users" ON public.profiles;

-- Create a secure public profiles view that only exposes safe fields
-- This view excludes sensitive fields like whatsapp_number and real_name
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  specialty,
  bio,
  reputation_score,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Policy: Users can view their own full profile (including sensitive fields)
CREATE POLICY "Users can view own full profile"
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admin can view all profiles (for admin functions)
CREATE POLICY "Admin can view all profiles"
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Note: WhatsApp number and real_name are now protected:
-- - Only accessible to the profile owner and admins
-- - Not exposed through public_profiles view
-- - Not accessible to other authenticated users

-- ========================================
-- Additional: Create function to safely check if user exists (for public use)
-- ========================================

CREATE OR REPLACE FUNCTION public.check_user_exists(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.public_profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_user_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_exists TO anon;
