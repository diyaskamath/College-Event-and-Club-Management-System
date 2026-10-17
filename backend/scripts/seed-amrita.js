'use strict';
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function main() {
  const { host, port, user, password, database } = config.db;
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    const [[campus]] = await conn.query("SELECT id FROM campuses WHERE slug = 'coimbatore' LIMIT 1");
    const campusId = campus ? campus.id : 1;

    // 1. Seed 4 specific Clubs
    const clubs = [
      {
        slug: 'book-club',
        name: 'The Book Club',
        description: 'A sanctuary for readers, creative writing circles, and intellectual book debriefs.',
        category: 'Literature'
      },
      {
        slug: 'film-club',
        name: 'Film & Cinema Club',
        description: 'Screening cinematic masterpieces, filmmaking workshops, and cinematography critique.',
        category: 'Media & Film'
      },
      {
        slug: 'sports-club',
        name: 'Sports Club',
        description: 'Athletics, inter-department tournaments, basketball, cricket, and unstoppable sporting spirit.',
        category: 'Sports'
      },
      {
        slug: 'iot-club',
        name: 'IoT & Robotics Club',
        description: 'Hardware hacking, sensor meshes, Arduino and robotics prototyping at the ECE Block.',
        category: 'Technology'
      }
    ];

    for (const cl of clubs) {
      await conn.query(
        `INSERT INTO clubs (slug, name, description, category, campus_id, is_demo, is_active)
         VALUES (?, ?, ?, ?, ?, 1, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), category = VALUES(category), is_active = 1`,
        [cl.slug, cl.name, cl.description, cl.category, campusId]
      );
    }

    // 2. Seed 2 Festivals: Dussera & Diwali
    const events = [
      {
        slug: 'dussera',
        title: 'Dussera Cultural Night',
        description: 'Sacred Ayudha Puja, classical cultural performances, and traditional pandhal feast for all departments.',
        kind: 'festival',
        category: 'Festival',
        event_type: 'Cultural Evening',
        organizer_name: 'Campus Cultural Committee',
        academic_block: 'AB2 Ground',
        venue: 'AB2 Ground',
        starts_at: '2026-10-20 09:00:00',
        ends_at: '2026-10-20 16:00:00',
        registration_deadline: '2026-10-19 23:59:59',
        capacity: 500,
        status: 'published'
      },
      {
        slug: 'diwali',
        title: 'Diwali Lights & Rangoli',
        description: 'Diyas lighting ceremony, vibrant rangoli competitions, eco-crackers, and late-night music & dance.',
        kind: 'festival',
        category: 'Festival',
        event_type: 'Festival Celebration',
        organizer_name: 'Campus Cultural Committee',
        academic_block: 'Main Campus Pandhal',
        venue: 'Main Campus Pandhal',
        starts_at: '2026-11-08 17:00:00',
        ends_at: '2026-11-08 23:00:00',
        registration_deadline: '2026-11-07 23:59:59',
        capacity: 600,
        status: 'published'
      }
    ];

    for (const ev of events) {
      await conn.query(
        `INSERT INTO events (slug, title, description, kind, category, event_type, organizer_name, campus_id, academic_block, venue, starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, is_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, 1)
         ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), venue = VALUES(venue), academic_block = VALUES(academic_block), starts_at = VALUES(starts_at), ends_at = VALUES(ends_at), status = 'published'`,
        [ev.slug, ev.title, ev.description, ev.kind, ev.category, ev.event_type, ev.organizer_name, campusId, ev.academic_block, ev.venue, ev.starts_at, ev.ends_at, ev.registration_deadline, ev.capacity, ev.status]
      );
    }

    const [allClubs] = await conn.query('SELECT slug, name FROM clubs');
    console.log('Current clubs in DB:', allClubs);

    const [allEvents] = await conn.query("SELECT slug, title, venue, status FROM events WHERE slug IN ('dussera', 'diwali')");
    console.log('Seeded events in DB:', allEvents);

    console.log('SUCCESS: Amrita clubs and events seeded successfully in MySQL.');
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
