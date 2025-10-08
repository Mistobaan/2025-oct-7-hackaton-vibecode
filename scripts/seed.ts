import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FAKE_USER_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
];

const PROFILES = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'alice@example.com', display_name: 'Alice Johnson', avatar_url: 'https://i.pravatar.cc/150?img=1' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'bob@example.com', display_name: 'Bob Smith', avatar_url: 'https://i.pravatar.cc/150?img=12' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'charlie@example.com', display_name: 'Charlie Davis', avatar_url: 'https://i.pravatar.cc/150?img=13' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'diana@example.com', display_name: 'Diana Martinez', avatar_url: 'https://i.pravatar.cc/150?img=5' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'eve@example.com', display_name: 'Eve Wilson', avatar_url: 'https://i.pravatar.cc/150?img=9' },
  { id: '66666666-6666-6666-6666-666666666666', email: 'frank@example.com', display_name: 'Frank Brown', avatar_url: 'https://i.pravatar.cc/150?img=11' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'grace@example.com', display_name: 'Grace Lee', avatar_url: 'https://i.pravatar.cc/150?img=45' },
  { id: '88888888-8888-8888-8888-888888888888', email: 'henry@example.com', display_name: 'Henry Taylor', avatar_url: 'https://i.pravatar.cc/150?img=14' },
];

const USER_INTERESTS = [
  { user_id: '11111111-1111-1111-1111-111111111111', interests: ['photography', 'travel', 'hiking'] },
  { user_id: '22222222-2222-2222-2222-222222222222', interests: ['coding', 'tech', 'gaming'] },
  { user_id: '33333333-3333-3333-3333-333333333333', interests: ['music', 'art', 'design'] },
  { user_id: '44444444-4444-4444-4444-444444444444', interests: ['fitness', 'yoga', 'cooking'] },
  { user_id: '55555555-5555-5555-5555-555555555555', interests: ['entrepreneurship', 'investing', 'tech'] },
  { user_id: '66666666-6666-6666-6666-666666666666', interests: ['photography', 'art', 'movies'] },
  { user_id: '77777777-7777-7777-7777-777777777777', interests: ['travel', 'reading', 'coffee'] },
  { user_id: '88888888-8888-8888-8888-888888888888', interests: ['sports', 'fitness', 'gaming'] },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('📝 Creating profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(PROFILES, { onConflict: 'id' });

    if (profileError) {
      console.error('Error creating profiles:', profileError);
    } else {
      console.log('✅ Profiles created');
    }

    console.log('🏷️  Adding user interests...');
    for (const user of USER_INTERESTS) {
      for (const interest of user.interests) {
        const { error } = await supabase
          .from('user_interests')
          .upsert({ user_id: user.user_id, interest }, { onConflict: 'user_id,interest' });

        if (error) console.error(`Error adding interest ${interest}:`, error.message);
      }
    }
    console.log('✅ User interests added');

    console.log('📅 Creating events...');
    const now = new Date();
    const events = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        created_by: '11111111-1111-1111-1111-111111111111',
        name: 'Photography Meetup SF',
        party_code: 'PHOTO1',
        description: 'Join us for a photography walk around San Francisco!',
        interests: ['photography', 'travel', 'art'],
        start_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_by: '22222222-2222-2222-2222-222222222222',
        name: 'Tech Startup Networking',
        party_code: 'TECH01',
        description: 'Connect with fellow entrepreneurs and developers',
        interests: ['tech', 'entrepreneurship', 'coding'],
        start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        max_attendees: 200,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        created_by: '33333333-3333-3333-3333-333333333333',
        name: 'Live Music & Art Night',
        party_code: 'MUSIC1',
        description: 'Local bands and art showcase at downtown gallery',
        interests: ['music', 'art', 'design'],
        start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        created_by: '44444444-4444-4444-4444-444444444444',
        name: 'Morning Yoga & Wellness',
        party_code: 'YOGA01',
        description: 'Start your day with yoga and healthy breakfast',
        interests: ['yoga', 'fitness', 'cooking'],
        start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        created_by: '55555555-5555-5555-5555-555555555555',
        name: 'Investor Pitch Night',
        party_code: 'INVEST',
        description: 'Present your startup idea to angel investors',
        interests: ['entrepreneurship', 'investing', 'tech'],
        start_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        created_by: '66666666-6666-6666-6666-666666666666',
        name: 'Film Photography Workshop',
        party_code: 'FILM01',
        description: 'Learn the art of analog photography',
        interests: ['photography', 'art'],
        start_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000001',
        created_by: '77777777-7777-7777-7777-777777777777',
        name: 'Book Club & Coffee',
        party_code: 'BOOKS1',
        description: 'Discuss latest bestsellers over coffee',
        interests: ['reading', 'coffee'],
        start_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        created_by: '88888888-8888-8888-8888-888888888888',
        name: 'Gaming Tournament',
        party_code: 'GAME01',
        description: 'Competitive gaming and casual play',
        interests: ['gaming', 'sports', 'tech'],
        start_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        max_attendees: 200,
        tier: 'basic',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        created_by: '11111111-1111-1111-1111-111111111111',
        name: 'Hiking Adventure Group',
        party_code: 'HIKE01',
        description: 'Weekly hiking trails in the Bay Area',
        interests: ['hiking', 'fitness', 'travel'],
        start_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        created_by: '22222222-2222-2222-2222-222222222222',
        name: 'Web Dev Workshop',
        party_code: 'CODE01',
        description: 'Learn React and Next.js from scratch',
        interests: ['coding', 'tech'],
        start_time: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'free',
        is_active: true,
      },
    ];

    const { error: eventError } = await supabase
      .from('events')
      .upsert(events, { onConflict: 'id' });

    if (eventError) {
      console.error('Error creating events:', eventError);
    } else {
      console.log('✅ Events created');
    }

    console.log('👥 Adding event attendees...');
    const attendees = [
      { event_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', user_id: '11111111-1111-1111-1111-111111111111', is_online: true },
      { event_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', user_id: '66666666-6666-6666-6666-666666666666', is_online: true },
      { event_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', user_id: '33333333-3333-3333-3333-333333333333', is_online: true },
      { event_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', user_id: '22222222-2222-2222-2222-222222222222', is_online: true },
      { event_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', user_id: '55555555-5555-5555-5555-555555555555', is_online: true },
      { event_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', user_id: '33333333-3333-3333-3333-333333333333', is_online: true },
      { event_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', user_id: '66666666-6666-6666-6666-666666666666', is_online: true },
      { event_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', user_id: '44444444-4444-4444-4444-444444444444', is_online: true },
      { event_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', user_id: '88888888-8888-8888-8888-888888888888', is_online: true },
      { event_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', user_id: '55555555-5555-5555-5555-555555555555', is_online: true },
      { event_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', user_id: '22222222-2222-2222-2222-222222222222', is_online: true },
      { event_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', user_id: '66666666-6666-6666-6666-666666666666', is_online: true },
      { event_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', user_id: '11111111-1111-1111-1111-111111111111', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000001', user_id: '77777777-7777-7777-7777-777777777777', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000002', user_id: '88888888-8888-8888-8888-888888888888', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000002', user_id: '22222222-2222-2222-2222-222222222222', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000003', user_id: '11111111-1111-1111-1111-111111111111', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000003', user_id: '77777777-7777-7777-7777-777777777777', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000003', user_id: '44444444-4444-4444-4444-444444444444', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000004', user_id: '22222222-2222-2222-2222-222222222222', is_online: true },
      { event_id: '00000000-0000-0000-0000-000000000004', user_id: '55555555-5555-5555-5555-555555555555', is_online: true },
    ];

    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .upsert(attendees, { onConflict: 'event_id,user_id' });

    if (attendeeError) {
      console.error('Error adding attendees:', attendeeError);
    } else {
      console.log('✅ Event attendees added');
    }

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${PROFILES.length} profiles`);
    console.log(`   - ${USER_INTERESTS.reduce((acc, u) => acc + u.interests.length, 0)} user interests`);
    console.log(`   - ${events.length} events`);
    console.log(`   - ${attendees.length} event attendees`);
    console.log('');
    console.log('⚠️  Note: These are fake profiles for testing. To use them, you would need to create');
    console.log('   corresponding auth users through Supabase Auth or manually.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();