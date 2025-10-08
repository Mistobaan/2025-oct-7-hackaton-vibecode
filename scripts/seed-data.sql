-- Seed Data for Testing Recommendations
-- This script creates fake users, events, and attendees for testing

-- Create fake users (profiles)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'diana@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'eve@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('66666666-6666-6666-6666-666666666666', 'frank@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('77777777-7777-7777-7777-777777777777', 'grace@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('88888888-8888-8888-8888-888888888888', 'henry@example.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create profiles for fake users
INSERT INTO profiles (id, email, display_name, avatar_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Johnson', 'https://i.pravatar.cc/150?img=1'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Smith', 'https://i.pravatar.cc/150?img=12'),
  ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', 'Charlie Davis', 'https://i.pravatar.cc/150?img=13'),
  ('44444444-4444-4444-4444-444444444444', 'diana@example.com', 'Diana Martinez', 'https://i.pravatar.cc/150?img=5'),
  ('55555555-5555-5555-5555-555555555555', 'eve@example.com', 'Eve Wilson', 'https://i.pravatar.cc/150?img=9'),
  ('66666666-6666-6666-6666-666666666666', 'frank@example.com', 'Frank Brown', 'https://i.pravatar.cc/150?img=11'),
  ('77777777-7777-7777-7777-777777777777', 'grace@example.com', 'Grace Lee', 'https://i.pravatar.cc/150?img=45'),
  ('88888888-8888-8888-8888-888888888888', 'henry@example.com', 'Henry Taylor', 'https://i.pravatar.cc/150?img=14')
ON CONFLICT (id) DO NOTHING;

-- Add user interests
INSERT INTO user_interests (user_id, interest)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'photography'),
  ('11111111-1111-1111-1111-111111111111', 'travel'),
  ('11111111-1111-1111-1111-111111111111', 'hiking'),
  ('22222222-2222-2222-2222-222222222222', 'coding'),
  ('22222222-2222-2222-2222-222222222222', 'tech'),
  ('22222222-2222-2222-2222-222222222222', 'gaming'),
  ('33333333-3333-3333-3333-333333333333', 'music'),
  ('33333333-3333-3333-3333-333333333333', 'art'),
  ('33333333-3333-3333-3333-333333333333', 'design'),
  ('44444444-4444-4444-4444-444444444444', 'fitness'),
  ('44444444-4444-4444-4444-444444444444', 'yoga'),
  ('44444444-4444-4444-4444-444444444444', 'cooking'),
  ('55555555-5555-5555-5555-555555555555', 'entrepreneurship'),
  ('55555555-5555-5555-5555-555555555555', 'investing'),
  ('55555555-5555-5555-5555-555555555555', 'tech'),
  ('66666666-6666-6666-6666-666666666666', 'photography'),
  ('66666666-6666-6666-6666-666666666666', 'art'),
  ('66666666-6666-6666-6666-666666666666', 'movies'),
  ('77777777-7777-7777-7777-777777777777', 'travel'),
  ('77777777-7777-7777-7777-777777777777', 'reading'),
  ('77777777-7777-7777-7777-777777777777', 'coffee'),
  ('88888888-8888-8888-8888-888888888888', 'sports'),
  ('88888888-8888-8888-8888-888888888888', 'fitness'),
  ('88888888-8888-8888-8888-888888888888', 'gaming')
ON CONFLICT DO NOTHING;

-- Create fake events
INSERT INTO events (id, created_by, name, party_code, description, interests, start_time, end_time, max_attendees, tier, is_active)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Photography Meetup SF', 'PHOTO1', 'Join us for a photography walk around San Francisco!', ARRAY['photography', 'travel', 'art'], now() + interval '3 days', now() + interval '3 days 3 hours', 100, 'free', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Tech Startup Networking', 'TECH01', 'Connect with fellow entrepreneurs and developers', ARRAY['tech', 'entrepreneurship', 'coding'], now() + interval '5 days', now() + interval '5 days 4 hours', 200, 'basic', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Live Music & Art Night', 'MUSIC1', 'Local bands and art showcase at downtown gallery', ARRAY['music', 'art', 'design'], now() + interval '7 days', now() + interval '7 days 5 hours', 100, 'free', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Morning Yoga & Wellness', 'YOGA01', 'Start your day with yoga and healthy breakfast', ARRAY['yoga', 'fitness', 'cooking'], now() + interval '2 days', now() + interval '2 days 2 hours', 100, 'free', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'Investor Pitch Night', 'INVEST', 'Present your startup idea to angel investors', ARRAY['entrepreneurship', 'investing', 'tech'], now() + interval '10 days', now() + interval '10 days 3 hours', 100, 'free', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 'Film Photography Workshop', 'FILM01', 'Learn the art of analog photography', ARRAY['photography', 'art'], now() + interval '6 days', now() + interval '6 days 4 hours', 100, 'free', true),
  ('00000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Book Club & Coffee', 'BOOKS1', 'Discuss latest bestsellers over coffee', ARRAY['reading', 'coffee'], now() + interval '4 days', now() + interval '4 days 2 hours', 100, 'free', true),
  ('00000000-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', 'Gaming Tournament', 'GAME01', 'Competitive gaming and casual play', ARRAY['gaming', 'sports', 'tech'], now() + interval '8 days', now() + interval '8 days 6 hours', 200, 'basic', true),
  ('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Hiking Adventure Group', 'HIKE01', 'Weekly hiking trails in the Bay Area', ARRAY['hiking', 'fitness', 'travel'], now() + interval '1 day', now() + interval '1 day 5 hours', 100, 'free', true),
  ('00000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Web Dev Workshop', 'CODE01', 'Learn React and Next.js from scratch', ARRAY['coding', 'tech'], now() + interval '9 days', now() + interval '9 days 3 hours', 100, 'free', true)
ON CONFLICT (id) DO NOTHING;

-- Add attendees to events
INSERT INTO event_attendees (event_id, user_id, is_online)
VALUES
  -- Photography Meetup (Alice's event)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', true),

  -- Tech Startup Networking (Bob's event)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', true),

  -- Music & Art Night (Charlie's event)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', true),

  -- Yoga & Wellness (Diana's event)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', true),

  -- Investor Pitch (Eve's event)
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', true),

  -- Film Photography (Frank's event)
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', true),

  -- Book Club (Grace's event)
  ('00000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', true),

  -- Gaming Tournament (Henry's event)
  ('00000000-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', true),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', true),

  -- Hiking Adventure (Alice's event)
  ('00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', true),
  ('00000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', true),
  ('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', true),

  -- Web Dev Workshop (Bob's event)
  ('00000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', true),
  ('00000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', true)
ON CONFLICT (event_id, user_id) DO NOTHING;
