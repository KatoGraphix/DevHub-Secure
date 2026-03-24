-- supabase_schema.sql
-- DevHub-Secure: Developer Dashboard Schema

-- 0. Clean up existing tables (safe to re-run)
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. Profiles Table & Security
-- ==========================================

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    role text CHECK (role IN ('admin_assigner', 'junior')) NOT NULL,
    role_id text UNIQUE NOT NULL,
    position text NOT NULL,
    access boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role WITHOUT triggering RLS (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin_assigner'
  );
$$;

-- RLS Policies for Profiles

-- 1. Anyone authenticated can SELECT profiles (no self-reference = no recursion)
CREATE POLICY "Everyone can view profiles" ON public.profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 2. Admins can INSERT profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT
    WITH CHECK ( public.is_admin() );

-- 3. Users can update their own profile, OR admins can update any
CREATE POLICY "Users or admins can update profiles" ON public.profiles
    FOR UPDATE
    USING ( auth.uid() = id OR public.is_admin() );

-- 4. Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE
    USING ( public.is_admin() );


-- ==========================================
-- 3. Tasks Table & Security
-- ==========================================
CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text CHECK (status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo' NOT NULL,
    priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
    due_date date,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tasks
-- 1. Admins have full access
CREATE POLICY "Admins manage all tasks" ON public.tasks
    FOR ALL
    USING ( public.is_admin() );

-- 2. Everyone can view all tasks
CREATE POLICY "Everyone views all tasks" ON public.tasks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 3. Juniors can update tasks assigned to them
CREATE POLICY "Juniors update own tasks" ON public.tasks
    FOR UPDATE
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
             SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'junior'
        )
    );


-- ==========================================
-- 4. Enable Realtime Notifications
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;


-- ==========================================
-- 5. Seed Data
-- ==========================================
-- IMPORTANT: Before running the INSERTs below, you must first create
-- these 6 users in Supabase Dashboard -> Authentication -> Users
-- with the emails listed. Then replace <UUID> with their auth.uid().
--
-- ROLE IDs:
--   MINT-CEO-001  = Chief Executive Officer       (admin_assigner)
--   MINT-CTO-002  = Chief Technology Officer       (admin_assigner)
--   MINT-SSD-003  = Senior Software Developer      (admin_assigner)
--   MINT-JSD-004  = Junior Software Developer      (junior)
--   MINT-JFD-005  = Junior Full Stack Developer    (junior)
--   MINT-ISD-006  = Intern Software Developer      (junior)

/*
-- ===== STEP 1: Insert Profiles (replace each <UUID> with the real auth.uid) =====

INSERT INTO public.profiles (id, first_name, last_name, email, role, role_id, position, access)
VALUES
  ('<UUID_LONWABO>',    'Lonwabo',    'Damane',        'lonwabo@mymint.co.za',              'admin_assigner', 'MINT-CEO-001', 'Chief Executive Officer',       true),
  ('<UUID_MIHLE>',      'Mihle',      'Matimba',       'mihle@mymint.co.za',                'admin_assigner', 'MINT-CTO-002', 'Chief Technology Officer',       true),
  ('<UUID_KURT>',       'Kurt',       'Von Schaeffer', 'kurt.vonschaeffer@mymint.co.za',    'admin_assigner', 'MINT-SSD-003', 'Senior Software Developer',      true),
  ('<UUID_MUFARO>',     'Mufaro',     'Ncube',         'mufaro.ncube@mymint.co.za',         'junior',         'MINT-JSD-004', 'Junior Software Developer',      true),
  ('<UUID_TSIE>',       'Tsie',       'Masilo',        'tsie.masilo@mymint.co.za',          'junior',         'MINT-JFD-005', 'Junior Full Stack Developer',    true),
  ('<UUID_MPUMELELO>',  'Mpumelelo',  'Maswanganye',   'mpumelelo@mymint.co.za',            'junior',         'MINT-ISD-006', 'Intern Software Developer',      true);

-- ===== STEP 2: Insert Sample Tasks (uses same <UUID> placeholders) =====

INSERT INTO public.tasks (title, description, status, priority, due_date, assigned_to, created_by)
VALUES
  -- Tasks assigned to Kurt (Senior Dev)
  ('Set up CI/CD pipeline',              'Configure GitHub Actions for automated testing and deployment to staging.',         'in_progress', 'high',   '2026-03-20', '<UUID_KURT>',      '<UUID_MIHLE>'),
  ('Implement authentication middleware', 'Add Supabase auth middleware to protect dashboard routes.',                        'todo',        'urgent', '2026-03-18', '<UUID_KURT>',      '<UUID_MIHLE>'),

  -- Tasks assigned to Mufaro (Junior Dev)
  ('Build task list component',           'Create a responsive task list page with filters for status and priority.',          'todo',        'high',   '2026-03-22', '<UUID_MUFARO>',    '<UUID_KURT>'),
  ('Add dark mode toggle',               'Implement a dark/light mode toggle using Tailwind CSS and localStorage.',           'todo',        'medium', '2026-03-25', '<UUID_MUFARO>',    '<UUID_KURT>'),

  -- Tasks assigned to Tsie (Junior Full Stack)
  ('Design Kanban board UI',             'Create drag-and-drop Kanban board for task management with status columns.',        'in_progress', 'high',   '2026-03-21', '<UUID_TSIE>',      '<UUID_KURT>'),
  ('API endpoint for task stats',        'Build a server-side API route that returns task counts grouped by status.',          'todo',        'medium', '2026-03-24', '<UUID_TSIE>',      '<UUID_MIHLE>'),

  -- Tasks assigned to Mpumelelo (Intern)
  ('Write unit tests for utils',         'Add Jest tests for utility functions in src/lib/utils.ts.',                         'todo',        'low',    '2026-03-28', '<UUID_MPUMELELO>', '<UUID_KURT>'),
  ('Update README documentation',        'Add setup instructions, environment variable guide, and architecture overview.',    'in_progress', 'medium', '2026-03-19', '<UUID_MPUMELELO>', '<UUID_KURT>'),

  -- Tasks created by CEO / CTO (admin overview)
  ('Q1 product roadmap review',          'Review and finalize the Q1 product roadmap with the dev team.',                     'review',      'urgent', '2026-03-15', '<UUID_LONWABO>',   '<UUID_LONWABO>'),
  ('Security audit preparation',         'Prepare documentation and access logs for the upcoming security audit.',            'todo',        'high',   '2026-03-26', '<UUID_MIHLE>',     '<UUID_LONWABO>');
*/
