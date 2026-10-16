-- Amrita Connect (CECMS) - DEMO seed data.   Safe to re-run: nothing is duplicated or overwritten.
--
-- INITIAL DEMO CONTENT (strict):  1 campus, exactly 8 clubs, exactly 3 regular events, exactly 2 festival events,
--                                 2 festival themes, default platform settings.
-- Every item is flagged is_demo=1.  Dates are RELATIVE to the moment the seed is first run, and venues / academic
-- blocks are explicit PLACEHOLDERS (venue_is_placeholder=1).  None of this is official Amrita information.
-- Coordinators/Admins can edit all of it from the application.

INSERT INTO campuses (slug, name, city, timezone, is_demo)
VALUES ('coimbatore', 'Coimbatore', 'Coimbatore', 'Asia/Kolkata', 1)
ON DUPLICATE KEY UPDATE slug = slug;

-- ---- exactly eight clubs -------------------------------------------------------------------------------------------
INSERT INTO clubs (slug, name, description, category, campus_id, is_demo)
SELECT v.slug, v.name, v.description, v.category, (SELECT id FROM campuses WHERE slug = 'coimbatore'), 1
FROM (
  SELECT 'literary-and-book-club' AS slug, 'Literary and Book Club' AS name,
         'Demo description: a community for readers and writers - book discussions, reading challenges and creative writing sessions.' AS description, 'Literature' AS category
  UNION ALL SELECT 'film-and-cinema-society', 'Film and Cinema Society',
         'Demo description: screenings, discussions and short-film projects for people who love cinema.', 'Media & Film'
  UNION ALL SELECT 'photography-and-visual-arts', 'Photography and Visual Arts',
         'Demo description: photo walks, editing workshops and exhibitions for photographers and visual artists.', 'Arts'
  UNION ALL SELECT 'coding-and-open-source', 'Coding and Open Source',
         'Demo description: build nights, hackathons and open-source contribution drives for student developers.', 'Technology'
  UNION ALL SELECT 'robotics-and-innovation', 'Robotics and Innovation',
         'Demo description: hands-on robotics builds, electronics tinkering and innovation challenges.', 'Technology'
  UNION ALL SELECT 'music-and-performing-arts', 'Music and Performing Arts',
         'Demo description: bands, solo performers, dance and theatre collaborating on campus showcases.', 'Performing Arts'
  UNION ALL SELECT 'debate-and-public-speaking', 'Debate and Public Speaking',
         'Demo description: structured debates, MUN-style practice and public-speaking coaching.', 'Communication'
  UNION ALL SELECT 'entrepreneurship', 'Entrepreneurship',
         'Demo description: idea pitching, founder talks and mentoring for student start-ups.', 'Business'
) v
WHERE NOT EXISTS (SELECT 1 FROM clubs c WHERE c.slug = v.slug);

-- ---- two festival themes (windows are demo placeholders around the festival-event dates) -------------------------------
INSERT INTO festival_themes (slug, name, description, campus_id, start_date, end_date, is_enabled, priority, config, is_demo)
SELECT 'diwali', 'Diwali Lights', 'Warm golden-amber theme with diyas and soft festival lights (demo schedule).', NULL,
       DATE_SUB(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 26 DAY)), INTERVAL 4 DAY),
       DATE_ADD(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 26 DAY)), INTERVAL 1 DAY),
       1, 10,
       '{"colors":{"primary":"#B45309","accent":"#F5B301","background":"#FFF8E7","surface":"#FFFDF7","text":"#2B1608","heroFrom":"#3B0A1E","heroTo":"#8A2C0D"},"banner":{"headline":"Light up the campus this Diwali","subtext":"Diyas, rangoli and a glow of good company - demo festival schedule."},"decoration":"diya","glow":0.9}',
       1
WHERE NOT EXISTS (SELECT 1 FROM festival_themes WHERE slug = 'diwali');

INSERT INTO festival_themes (slug, name, description, campus_id, start_date, end_date, is_enabled, priority, config, is_demo)
SELECT 'dussehra-navaratri', 'Dussehra & Navaratri', 'Vibrant magenta, violet and marigold theme with festive garlands (demo schedule).', NULL,
       DATE_SUB(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)), INTERVAL 4 DAY),
       DATE_ADD(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)), INTERVAL 1 DAY),
       1, 10,
       '{"colors":{"primary":"#A3155E","accent":"#FF9800","background":"#FBF4FF","surface":"#FFFFFF","text":"#26103A","heroFrom":"#4A148C","heroTo":"#C2185B"},"banner":{"headline":"A colourful cultural evening awaits","subtext":"Marigolds, music and celebration - demo festival schedule."},"decoration":"marigold","glow":0.5}',
       1
WHERE NOT EXISTS (SELECT 1 FROM festival_themes WHERE slug = 'dussehra-navaratri');

-- ---- exactly three regular events -----------------------------------------------------------------------------------------
INSERT INTO events (slug, title, description, kind, category, event_type, club_id, organizer_name, campus_id, academic_block, venue, venue_is_placeholder,
                    starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, is_demo)
SELECT 'build-night-tiny-web-apps', 'Build Night: Tiny Web Apps',
       'Demo description: a hands-on coding workshop where participants build and ship a tiny web app in one evening. Bring a laptop; beginners welcome.',
       'regular', 'Technology', 'Workshop', c.id, c.name, c.campus_id,
       'Academic block to be confirmed (placeholder)', 'Venue to be confirmed (placeholder)', 1,
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 9 DAY)), '11:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 9 DAY)), '14:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)), '11:30:00'),
       40, 1, 0, 'published', 1
FROM clubs c WHERE c.slug = 'coding-and-open-source'
  AND NOT EXISTS (SELECT 1 FROM events e WHERE e.slug = 'build-night-tiny-web-apps');

INSERT INTO events (slug, title, description, kind, category, event_type, club_id, organizer_name, campus_id, academic_block, venue, venue_is_placeholder,
                    starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, is_demo)
SELECT 'stories-after-hours', 'Stories After Hours',
       'Demo description: a relaxed evening book discussion - share what you are reading and discover your next favourite story.',
       'regular', 'Literature', 'Discussion', c.id, c.name, c.campus_id,
       'Academic block to be confirmed (placeholder)', 'Venue to be confirmed (placeholder)', 1,
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 13 DAY)), '12:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 13 DAY)), '14:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 11 DAY)), '12:30:00'),
       30, 1, 0, 'published', 1
FROM clubs c WHERE c.slug = 'literary-and-book-club'
  AND NOT EXISTS (SELECT 1 FROM events e WHERE e.slug = 'stories-after-hours');

INSERT INTO events (slug, title, description, kind, category, event_type, club_id, organizer_name, campus_id, academic_block, venue, venue_is_placeholder,
                    starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, is_demo)
SELECT 'pitch-your-first-idea', 'Pitch Your First Idea',
       'Demo description: an entrepreneurship workshop on turning a rough idea into a clear 3-minute pitch, with feedback from peers.',
       'regular', 'Entrepreneurship', 'Workshop', c.id, c.name, c.campus_id,
       'Academic block to be confirmed (placeholder)', 'Venue to be confirmed (placeholder)', 1,
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 19 DAY)), '10:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 19 DAY)), '13:00:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 17 DAY)), '10:30:00'),
       35, 1, 0, 'published', 1
FROM clubs c WHERE c.slug = 'entrepreneurship'
  AND NOT EXISTS (SELECT 1 FROM events e WHERE e.slug = 'pitch-your-first-idea');

-- ---- exactly two festival events (campus-wide, Admin-managed, no club) -------------------------------------------------------
INSERT INTO events (slug, title, description, kind, category, event_type, club_id, organizer_name, campus_id, academic_block, venue, venue_is_placeholder,
                    starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, festival_theme_id, is_demo)
SELECT 'diwali-lights-and-rangoli', 'Diwali Lights & Rangoli',
       'Demo description: an evening of diya decorating and rangoli making. Sample festival event - not an official Amrita schedule.',
       'festival', 'Festival', 'Festival Celebration', NULL, 'Campus Cultural Committee (demo placeholder)',
       (SELECT id FROM campuses WHERE slug = 'coimbatore'),
       'Academic block to be confirmed (placeholder)', 'Venue to be confirmed (placeholder)', 1,
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 26 DAY)), '12:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 26 DAY)), '15:30:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 DAY)), '12:30:00'),
       150, 1, 0, 'published', (SELECT id FROM festival_themes WHERE slug = 'diwali'), 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.slug = 'diwali-lights-and-rangoli');

INSERT INTO events (slug, title, description, kind, category, event_type, club_id, organizer_name, campus_id, academic_block, venue, venue_is_placeholder,
                    starts_at, ends_at, registration_deadline, capacity, waitlist_enabled, requires_approval, status, festival_theme_id, is_demo)
SELECT 'dussehra-and-navaratri-cultural-evening', 'Dussehra and Navaratri Cultural Evening',
       'Demo description: a cultural evening of music, dance and storytelling. Sample festival event - not an official Amrita schedule.',
       'festival', 'Festival', 'Cultural Evening', NULL, 'Campus Cultural Committee (demo placeholder)',
       (SELECT id FROM campuses WHERE slug = 'coimbatore'),
       'Academic block to be confirmed (placeholder)', 'Venue to be confirmed (placeholder)', 1,
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)), '13:00:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)), '16:00:00'),
       TIMESTAMP(DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 DAY)), '13:00:00'),
       200, 1, 0, 'published', (SELECT id FROM festival_themes WHERE slug = 'dussehra-navaratri'), 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.slug = 'dussehra-and-navaratri-cultural-evening');

-- ---- default platform settings ------------------------------------------------------------------------------------------------
INSERT INTO platform_settings (setting_key, setting_value) VALUES ('require_student_login_otp', 'false'), ('reminder_hours', '24')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
