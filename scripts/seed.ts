import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROFILES = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'sarah.tech@example.com', display_name: 'Sarah Chen', bio: 'Software engineer passionate about AI and machine learning. Love hiking on weekends!', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'mike.fitness@example.com', display_name: 'Mike Rodriguez', bio: 'Personal trainer and nutrition coach. CrossFit enthusiast and marathon runner.', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'emma.artist@example.com', display_name: 'Emma Williams', bio: 'Digital artist and illustrator. Coffee addict and photography lover.', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'james.startup@example.com', display_name: 'James Park', bio: 'Entrepreneur and startup advisor. Building the future of fintech.', avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'lisa.yoga@example.com', display_name: 'Lisa Martinez', bio: 'Yoga instructor and wellness coach. Plant-based lifestyle advocate.', avatar_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '66666666-6666-6666-6666-666666666666', email: 'david.chef@example.com', display_name: 'David Thompson', bio: 'Professional chef specializing in fusion cuisine. Food blogger and recipe creator.', avatar_url: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '77777777-7777-7777-7777-777777777777', email: 'nina.travel@example.com', display_name: 'Nina Patel', bio: 'Travel photographer and adventure seeker. Visited 45 countries and counting!', avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '88888888-8888-8888-8888-888888888888', email: 'alex.music@example.com', display_name: 'Alex Turner', bio: 'Music producer and DJ. Electronic music enthusiast and vinyl collector.', avatar_url: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: '99999999-9999-9999-9999-999999999999', email: 'rachel.writer@example.com', display_name: 'Rachel Kim', bio: 'Freelance writer and book lover. Mystery novels are my jam!', avatar_url: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'tom.gamer@example.com', display_name: 'Tom Anderson', bio: 'Game developer and esports fan. Building VR experiences.', avatar_url: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

const USER_INTERESTS = [
  { user_id: '11111111-1111-1111-1111-111111111111', interests: ['Artificial Intelligence', 'Machine Learning', 'Hiking', 'Technology'] },
  { user_id: '22222222-2222-2222-2222-222222222222', interests: ['Fitness', 'CrossFit', 'Running', 'Nutrition'] },
  { user_id: '33333333-3333-3333-3333-333333333333', interests: ['Digital Art', 'Photography', 'Coffee', 'Design'] },
  { user_id: '44444444-4444-4444-4444-444444444444', interests: ['Entrepreneurship', 'Fintech', 'Startups', 'Technology'] },
  { user_id: '55555555-5555-5555-5555-555555555555', interests: ['Yoga', 'Meditation', 'Plant-Based', 'Wellness'] },
  { user_id: '66666666-6666-6666-6666-666666666666', interests: ['Cooking', 'Food', 'Baking', 'Recipe Development'] },
  { user_id: '77777777-7777-7777-7777-777777777777', interests: ['Travel', 'Photography', 'Adventure', 'Hiking'] },
  { user_id: '88888888-8888-8888-8888-888888888888', interests: ['Music', 'DJing', 'Electronic Music', 'Vinyl'] },
  { user_id: '99999999-9999-9999-9999-999999999999', interests: ['Writing', 'Reading', 'Books', 'Mystery'] },
  { user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', interests: ['Gaming', 'VR', 'Game Development', 'Technology'] },
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
        id: 'e1111111-1111-1111-1111-111111111111',
        created_by: '11111111-1111-1111-1111-111111111111',
        name: 'AI & Machine Learning Summit 2025',
        party_code: 'AI2025',
        description: 'Join industry leaders to discuss the latest advancements in AI, ML, and deep learning. Network with fellow AI enthusiasts and learn about cutting-edge applications.',
        location: 'San Francisco Convention Center',
        interests: ['Artificial Intelligence', 'Machine Learning', 'Technology'],
        start_time: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
        max_attendees: 200,
        tier: 'premium',
        is_active: true,
      },
      {
        id: 'e2222222-2222-2222-2222-222222222222',
        created_by: '22222222-2222-2222-2222-222222222222',
        name: 'CrossFit Community Workout',
        party_code: 'CFIT01',
        description: 'High-intensity group workout session for all fitness levels. Meet like-minded fitness enthusiasts and push your limits together!',
        location: 'Downtown Fitness Center',
        interests: ['Fitness', 'CrossFit', 'Health'],
        start_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 50,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'e3333333-3333-3333-3333-333333333333',
        created_by: '33333333-3333-3333-3333-333333333333',
        name: 'Digital Art Exhibition & Meetup',
        party_code: 'ART101',
        description: 'Showcase your digital artwork and connect with fellow artists. Workshop on latest digital art tools and techniques included.',
        location: 'Modern Art Gallery',
        interests: ['Digital Art', 'Photography', 'Design'],
        start_time: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        max_attendees: 75,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'e4444444-4444-4444-4444-444444444444',
        created_by: '44444444-4444-4444-4444-444444444444',
        name: 'Startup Pitch Night',
        party_code: 'PITCH1',
        description: 'Watch emerging startups pitch their ideas to investors. Great networking opportunity for entrepreneurs and investors.',
        location: 'Tech Hub Co-working Space',
        interests: ['Entrepreneurship', 'Startups', 'Fintech', 'Technology'],
        start_time: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 100,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'e5555555-5555-5555-5555-555555555555',
        created_by: '55555555-5555-5555-5555-555555555555',
        name: 'Sunrise Yoga in the Park',
        party_code: 'YOGA01',
        description: 'Start your day with peaceful yoga practice surrounded by nature. All levels welcome!',
        location: 'Central Park Meadow',
        interests: ['Yoga', 'Meditation', 'Wellness'],
        start_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 1.25 * 60 * 60 * 1000).toISOString(),
        max_attendees: 30,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'e6666666-6666-6666-6666-666666666666',
        created_by: '66666666-6666-6666-6666-666666666666',
        name: 'Fusion Cooking Masterclass',
        party_code: 'COOK01',
        description: 'Learn to create delicious fusion dishes combining Asian and Mediterranean flavors. Hands-on cooking experience!',
        location: 'Culinary Institute Kitchen',
        interests: ['Cooking', 'Food', 'Recipe Development'],
        start_time: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 20,
        tier: 'premium',
        is_active: true,
      },
      {
        id: 'e7777777-7777-7777-7777-777777777777',
        created_by: '77777777-7777-7777-7777-777777777777',
        name: 'Travel Photography Workshop',
        party_code: 'PHOTO1',
        description: 'Master the art of travel photography. Tips on composition, lighting, and storytelling through images.',
        location: 'Photography Studio Downtown',
        interests: ['Photography', 'Travel', 'Adventure'],
        start_time: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
        max_attendees: 25,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'e8888888-8888-8888-8888-888888888888',
        created_by: '88888888-8888-8888-8888-888888888888',
        name: 'Electronic Music Production Workshop',
        party_code: 'MUSIC1',
        description: 'Learn music production techniques from professional producers. Bring your laptop and get hands-on experience.',
        location: 'Sound Studio',
        interests: ['Music', 'Electronic Music', 'DJing'],
        start_time: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 40,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'e9999999-9999-9999-9999-999999999999',
        created_by: '99999999-9999-9999-9999-999999999999',
        name: 'Mystery Book Club Meetup',
        party_code: 'BOOKS1',
        description: 'Discuss this month\'s mystery novel over coffee. New members welcome!',
        location: 'Cozy Corner Bookshop',
        interests: ['Books', 'Reading', 'Mystery', 'Writing'],
        start_time: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 15,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        created_by: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'VR Gaming Tournament',
        party_code: 'VRGAME',
        description: 'Compete in the latest VR games and win prizes. Experience cutting-edge VR technology.',
        location: 'VR Gaming Arena',
        interests: ['Gaming', 'VR', 'Technology'],
        start_time: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 60,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'ebbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        created_by: '11111111-1111-1111-1111-111111111111',
        name: 'Mountain Hiking Adventure',
        party_code: 'HIKE01',
        description: 'Join us for a challenging but rewarding hike with stunning views. Intermediate level.',
        location: 'Blue Ridge Mountains Trailhead',
        interests: ['Hiking', 'Adventure', 'Fitness'],
        start_time: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
        max_attendees: 25,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'ecccccc-cccc-cccc-cccc-cccccccccccc',
        created_by: '55555555-5555-5555-5555-555555555555',
        name: 'Plant-Based Cooking Class',
        party_code: 'VEGAN1',
        description: 'Discover delicious plant-based recipes that are healthy and satisfying. Taste testing included!',
        location: 'Green Kitchen Studio',
        interests: ['Cooking', 'Plant-Based', 'Wellness', 'Food'],
        start_time: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
        max_attendees: 20,
        tier: 'basic',
        is_active: true,
      },
      {
        id: 'edddddd-dddd-dddd-dddd-dddddddddddd',
        created_by: '33333333-3333-3333-3333-333333333333',
        name: 'Photography Coffee Walk',
        party_code: 'PCAFE1',
        description: 'Casual photo walk through the city with coffee stops. Share tips and capture urban beauty.',
        location: 'Downtown Coffee District',
        interests: ['Photography', 'Coffee', 'Design'],
        start_time: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 15,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'eeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        created_by: '22222222-2222-2222-2222-222222222222',
        name: 'Marathon Training Group',
        party_code: 'MARA01',
        description: 'Weekly long run with experienced marathon runners. Preparing for spring marathon season.',
        location: 'City Park Running Track',
        interests: ['Running', 'Fitness', 'Health'],
        start_time: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        max_attendees: 40,
        tier: 'free',
        is_active: true,
      },
      {
        id: 'effffff-ffff-ffff-ffff-ffffffffffff',
        created_by: '44444444-4444-4444-4444-444444444444',
        name: 'Tech Founders Networking Mixer',
        party_code: 'TECH01',
        description: 'Connect with other tech entrepreneurs and founders. Casual networking with drinks and appetizers.',
        location: 'Innovation Hub Rooftop',
        interests: ['Technology', 'Entrepreneurship', 'Startups'],
        start_time: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        max_attendees: 80,
        tier: 'basic',
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

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${PROFILES.length} profiles`);
    console.log(`   - ${USER_INTERESTS.reduce((acc, u) => acc + u.interests.length, 0)} user interests`);
    console.log(`   - ${events.length} events`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
