-- ============================================================
-- TEST SEED: Messages page manual testing
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- STEP 1: Replace 'YOUR_USER_ID_HERE' with your actual UUID
-- To find it, run:  SELECT id, email FROM auth.users;
DO $$
DECLARE
  my_user_id uuid := 'YOUR_USER_ID_HERE';
BEGIN

  -- STEP 2: Create fake test users in auth.users + profiles
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    ('00000000-0000-0000-0000-000000000001', 'testuser1@cohabit.test',
     '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000002', 'testuser2@cohabit.test',
     '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12', now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, bio, location_city)
  VALUES
    ('00000000-0000-0000-0000-000000000001', 'testuser1@cohabit.test',
     'Alex Johnson', '', 'Looking for a clean, quiet roommate in downtown.', 'Austin'),
    ('00000000-0000-0000-0000-000000000002', 'testuser2@cohabit.test',
     'Sam Rivera', '', 'Grad student, early riser, loves cooking.', 'Austin')
  ON CONFLICT (id) DO NOTHING;

  -- STEP 3: Create accepted matches between you and the test users
  INSERT INTO public.matches (user_id_1, user_id_2, compatibility_score, status)
  VALUES
    (my_user_id, '00000000-0000-0000-0000-000000000001', 87, 'accepted'),
    (my_user_id, '00000000-0000-0000-0000-000000000002', 72, 'accepted')
  ON CONFLICT (user_id_1, user_id_2) DO NOTHING;

  -- STEP 4: Seed a few messages so the chat isn't empty
  INSERT INTO public.messages (sender_id, receiver_id, content)
  VALUES
    ('00000000-0000-0000-0000-000000000001', my_user_id, 'Hey! I saw your profile on coHabit'),
    ('00000000-0000-0000-0000-000000000001', my_user_id, 'Is the room still available?'),
    (my_user_id, '00000000-0000-0000-0000-000000000001', 'Hi! Yes it is, want to schedule a visit?'),
    ('00000000-0000-0000-0000-000000000001', my_user_id, 'That would be great! How about Saturday?'),
    (my_user_id, '00000000-0000-0000-0000-000000000001', 'Saturday works. 2pm?'),
    ('00000000-0000-0000-0000-000000000002', my_user_id, 'Hi there! Love your place listing!');

END $$;
