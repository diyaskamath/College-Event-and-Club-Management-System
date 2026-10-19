'use strict';
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

async function seed() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    const [[campus]] = await conn.query("SELECT id FROM campuses WHERE slug = 'coimbatore' LIMIT 1");
    const campusId = campus ? campus.id : 1;

    // 1. Seed demo accounts
    const studentPass = await bcrypt.hash('StudentPass123!', config.auth.bcryptRounds);
    const coordPass = await bcrypt.hash('CoordPass123!', config.auth.bcryptRounds);
    const adminPass = await bcrypt.hash('AdminPass123!', config.auth.bcryptRounds);

    const users = [
      {
        name: 'Diya Kamath',
        email: 'student@cb.students.amrita.edu',
        phone: '+919876543201',
        admin_id: null,
        password_hash: studentPass,
        role: 'student',
        status: 'active',
        department: 'CSE',
        year_of_study: 3
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.ece@cb.students.amrita.edu',
        phone: '+919876543202',
        admin_id: null,
        password_hash: studentPass,
        role: 'student',
        status: 'active',
        department: 'ECE',
        year_of_study: 2
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'coordinator@cb.amrita.edu',
        phone: '+919876543210',
        admin_id: null,
        password_hash: coordPass,
        role: 'coordinator',
        status: 'active',
        department: 'CSE',
        year_of_study: null
      },
      {
        name: 'Dr. S. Abhishek',
        email: 'coord.ece@cb.amrita.edu',
        phone: '+919876543212',
        admin_id: null,
        password_hash: coordPass,
        role: 'coordinator',
        status: 'active',
        department: 'ECE',
        year_of_study: null
      },
      {
        name: 'Dr. K. S. Admin',
        email: 'admin@cb.amrita.edu',
        phone: '+919876543211',
        admin_id: 'ADM-001',
        password_hash: adminPass,
        role: 'admin',
        status: 'active',
        department: 'Central Administration',
        year_of_study: null
      },
      {
        name: 'Chief Admin Sharma',
        email: 'admin2@cb.amrita.edu',
        phone: '+919876543213',
        admin_id: 'ADM-002',
        password_hash: adminPass,
        role: 'admin',
        status: 'active',
        department: 'Academic Directorate',
        year_of_study: null
      }
    ];

    for (const u of users) {
      const [existing] = await conn.query('SELECT id FROM users WHERE email=? OR (admin_id IS NOT NULL AND admin_id=?)', [u.email, u.admin_id || '']);
      if (!existing.length) {
        const [res] = await conn.query(
          `INSERT INTO users (name, email, phone, admin_id, password_hash, role, status, email_verified_at, campus_id, department, year_of_study)
           VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?, ?)`,
          [u.name, u.email, u.phone, u.admin_id, u.password_hash, u.role, u.status, campusId, u.department, u.year_of_study]
        );
        await conn.query('INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)', [res.insertId]);
      } else {
        await conn.query(
          `UPDATE users SET name=?, password_hash=?, phone=?, role=?, status='active', department=?, year_of_study=? WHERE id=?`,
          [u.name, u.password_hash, u.phone, u.role, u.department, u.year_of_study, existing[0].id]
        );
      }
    }

    // Assign coordinators to clubs
    const [[coordUser]] = await conn.query("SELECT id FROM users WHERE email='coordinator@cb.amrita.edu'");
    if (coordUser) {
      const [clubs] = await conn.query("SELECT id FROM clubs WHERE slug IN ('book-club', 'film-club', 'sports-club', 'iot-club')");
      for (const cl of clubs) {
        await conn.query('INSERT IGNORE INTO coordinator_assignments (user_id, club_id) VALUES (?, ?)', [coordUser.id, cl.id]);
      }
    }

    // Seed sample announcements
    const [[authorUser]] = await conn.query("SELECT id FROM users WHERE role IN ('coordinator', 'admin') LIMIT 1");
    const authorId = authorUser ? authorUser.id : 1;

    const announcements = [
      {
        title: 'End Semester Project Exhibition 2026',
        body: 'All final year and third year students must submit their project abstracts before Nov 15th to the respective department coordinators.',
        source_tag: 'HOD',
        target_tag: 'All Branches'
      },
      {
        title: 'VLSI Design & Embedded Systems Workshop in AB-2',
        body: 'Hands-on Cadence lab sessions and FPGA synthesis demo scheduled for ECE & CCE 3rd year students in AB-2 Lab 402.',
        source_tag: 'Prof',
        target_tag: 'ECE'
      },
      {
        title: 'Dussera Holiday & Ayudha Puja Schedule',
        body: 'Campus offices and lecture blocks will observe official holidays on Oct 20th for Ayudha Puja. Cultural events at AB2 Ground begin at 9 AM.',
        source_tag: 'Main Office',
        target_tag: 'All Branches'
      },
      {
        title: 'Coding Guild Hackathon Registration Open',
        body: 'Register teams of 3-4 for the 24-hour Tiny Web Apps Hackathon in AB-3. Mentors from top tech firms will be present.',
        source_tag: 'Coordination',
        target_tag: 'CSE'
      },
      {
        title: 'Robotics Prototyping & Drone Testing Sessions',
        body: 'Autonomous obstacle avoidance and micro-controller calibration drive this Saturday at ECE Block ground floor.',
        source_tag: 'Coordination',
        target_tag: 'AI'
      }
    ];

    for (const ann of announcements) {
      const [existing] = await conn.query('SELECT id FROM announcements WHERE title=?', [ann.title]);
      if (!existing.length) {
        await conn.query(
          `INSERT INTO announcements (author_id, title, body, source_tag, target_tag)
           VALUES (?, ?, ?, ?, ?)`,
          [authorId, ann.title, ann.body, ann.source_tag, ann.target_tag]
        );
      }
    }

    // Seed sample complaints
    const [[studentUser]] = await conn.query("SELECT id FROM users WHERE email='student@cb.students.amrita.edu'");
    if (studentUser) {
      const complaints = [
        {
          title: 'Lab 304 Air Conditioning malfunction in AB-3',
          description: 'The central AC in Computer Lab 4 has been non-functional during afternoon lab hours, causing machines to overheat.',
          category: 'Infrastructure',
          branch: 'CSE',
          status: 'In Progress',
          admin_response: 'Maintenance team has been dispatched to check the compressor unit.'
        },
        {
          title: 'Extended library reading room hours during End-Term exams',
          description: 'Requesting the central library reading hall to stay open till 11:30 PM on weekdays during exam preparation weeks.',
          category: 'Academic',
          branch: 'All Branches',
          status: 'Pending',
          admin_response: null
        },
        {
          title: 'Hostel Wi-Fi signal drop at Mythreyi Block C',
          description: 'Wi-Fi speeds drop significantly after 9 PM in the 2nd floor corridor of Mythreyi hostel.',
          category: 'Hostel',
          branch: 'All Branches',
          status: 'Resolved',
          admin_response: 'IT Department replaced the access point router and updated channel bandwidth on Oct 14th.'
        }
      ];

      for (const comp of complaints) {
        const [existing] = await conn.query('SELECT id FROM complaints WHERE title=?', [comp.title]);
        if (!existing.length) {
          await conn.query(
            `INSERT INTO complaints (user_id, title, description, category, branch, status, admin_response)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [studentUser.id, comp.title, comp.description, comp.category, comp.branch, comp.status, comp.admin_response]
          );
        }
      }
    }

    console.log('SUCCESS: Overhaul seed applied (Accounts, Announcements, Complaints, Assignments).');
  } finally {
    await conn.end();
  }
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
