-- Amrita Connect (CECMS) database schema.  Targets MySQL 8.x (also runs on MariaDB 10.6+).
-- Safe to re-run: every statement uses IF NOT EXISTS.
-- All DATETIME values are stored in UTC.  DATE columns on festival_themes are campus-local calendar dates.

CREATE TABLE IF NOT EXISTS campuses (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(60)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  city        VARCHAR(120) NULL,
  timezone    VARCHAR(60)  NOT NULL DEFAULT 'Asia/Kolkata',
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  is_demo     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campuses_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  phone           VARCHAR(20)  NULL,                       -- E.164, required for coordinator/admin
  password_hash   VARCHAR(100) NOT NULL,
  role            ENUM('student','coordinator','admin') NOT NULL DEFAULT 'student',
  status          ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  email_verified_at DATETIME   NULL,
  campus_id       INT UNSIGNED NULL,
  department      VARCHAR(120) NULL,
  year_of_study   TINYINT UNSIGNED NULL,
  bio             VARCHAR(500) NULL,
  last_login_at   DATETIME     NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_phone (phone),
  CONSTRAINT fk_users_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id          CHAR(36)     NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  expires_at  DATETIME     NOT NULL,
  revoked_at  DATETIME     NULL,
  ip          VARCHAR(64)  NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS otp_challenges (
  id             CHAR(36)     NOT NULL,
  user_id        INT UNSIGNED NOT NULL,
  purpose        ENUM('register','login') NOT NULL,
  channel        ENUM('email','sms') NOT NULL,
  destination    VARCHAR(190) NOT NULL,                    -- stored for rate limiting; never returned unmasked
  code_hash      CHAR(64)     NOT NULL,                    -- HMAC-SHA256, never the plain code
  attempts       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts   TINYINT UNSIGNED NOT NULL DEFAULT 5,
  resend_count   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at     DATETIME     NOT NULL,
  last_sent_at   DATETIME     NOT NULL,
  consumed_at    DATETIME     NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_user (user_id),
  KEY idx_otp_dest_created (destination, created_at),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clubs (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(100) NOT NULL,
  name          VARCHAR(150) NOT NULL,
  description   TEXT         NOT NULL,
  category      VARCHAR(60)  NOT NULL,
  campus_id     INT UNSIGNED NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  is_demo       TINYINT(1)   NOT NULL DEFAULT 0,
  created_by    INT UNSIGNED NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clubs_slug (slug),
  UNIQUE KEY uq_clubs_name (name),
  KEY idx_clubs_category (category),
  CONSTRAINT fk_clubs_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE SET NULL,
  CONSTRAINT fk_clubs_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS club_memberships (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  status      ENUM('active','left') NOT NULL DEFAULT 'active',
  join_count  INT UNSIGNED NOT NULL DEFAULT 1,             -- increments on re-join; used in notification dedupe keys
  joined_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at     DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_membership (club_id, user_id),             -- prevents duplicate memberships
  KEY idx_membership_user (user_id, status),
  CONSTRAINT fk_mem_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_mem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS club_requests (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  requested_by    INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  description     TEXT         NOT NULL,
  category        VARCHAR(60)  NOT NULL,
  justification   VARCHAR(1000) NULL,
  status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by     INT UNSIGNED NULL,
  reviewed_at     DATETIME     NULL,
  review_note     VARCHAR(500) NULL,
  created_club_id INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creq_status (status),
  KEY idx_creq_user (requested_by),
  CONSTRAINT fk_creq_user FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_creq_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_creq_club FOREIGN KEY (created_club_id) REFERENCES clubs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coordinator_assignments (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  club_id      INT UNSIGNED NOT NULL,
  assigned_by  INT UNSIGNED NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_assignment (user_id, club_id),
  KEY idx_assign_club (club_id),
  CONSTRAINT fk_assign_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS festival_themes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(60)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(300) NULL,
  campus_id   INT UNSIGNED NULL,                           -- NULL = applies to every campus
  start_date  DATE         NOT NULL,                       -- inclusive, campus-local date
  end_date    DATE         NOT NULL,                       -- inclusive, campus-local date
  is_enabled  TINYINT(1)   NOT NULL DEFAULT 1,
  priority    INT          NOT NULL DEFAULT 0,             -- overlap tie-break: higher wins
  config      JSON         NOT NULL,                       -- colours, banner text, decoration style, glow
  is_demo     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_theme_slug (slug),
  KEY idx_theme_dates (is_enabled, start_date, end_date),
  CONSTRAINT fk_theme_campus FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE,
  CONSTRAINT chk_theme_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug                  VARCHAR(140) NOT NULL,
  title                 VARCHAR(200) NOT NULL,
  description           TEXT         NOT NULL,
  kind                  ENUM('regular','festival') NOT NULL DEFAULT 'regular',
  category              VARCHAR(60)  NOT NULL,
  event_type            VARCHAR(60)  NULL,
  club_id               INT UNSIGNED NULL,                 -- NULL for campus-wide (festival) events; Admin-managed
  organizer_name        VARCHAR(190) NOT NULL,
  campus_id             INT UNSIGNED NOT NULL,
  academic_block        VARCHAR(150) NULL,
  venue                 VARCHAR(190) NULL,
  venue_is_placeholder  TINYINT(1)   NOT NULL DEFAULT 0,
  starts_at             DATETIME     NOT NULL,
  ends_at               DATETIME     NOT NULL,
  registration_deadline DATETIME     NOT NULL,
  capacity              INT UNSIGNED NOT NULL,
  waitlist_enabled      TINYINT(1)   NOT NULL DEFAULT 1,
  requires_approval     TINYINT(1)   NOT NULL DEFAULT 0,
  status                ENUM('draft','published','registration_closed','ongoing','completed','cancelled') NOT NULL DEFAULT 'draft',
  cancel_reason         VARCHAR(500) NULL,
  festival_theme_id     INT UNSIGNED NULL,
  is_demo               TINYINT(1)   NOT NULL DEFAULT 0,
  version               INT UNSIGNED NOT NULL DEFAULT 1,   -- bumps on every edit; used in notification dedupe keys
  created_by            INT UNSIGNED NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_events_slug (slug),
  KEY idx_events_status_start (status, starts_at),
  KEY idx_events_campus (campus_id),
  KEY idx_events_club (club_id),
  KEY idx_events_category (category),
  CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
  CONSTRAINT fk_events_campus FOREIGN KEY (campus_id) REFERENCES campuses(id),
  CONSTRAINT fk_events_theme FOREIGN KEY (festival_theme_id) REFERENCES festival_themes(id) ON DELETE SET NULL,
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_events_times CHECK (ends_at > starts_at),
  CONSTRAINT chk_events_capacity CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_registrations (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id       INT UNSIGNED NOT NULL,
  user_id        INT UNSIGNED NOT NULL,
  status         ENUM('pending','confirmed','waitlisted','cancelled','rejected') NOT NULL,
  cycle          INT UNSIGNED NOT NULL DEFAULT 1,          -- increments on re-registration; used in dedupe keys
  registered_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  waitlisted_at  DATETIME(3)  NULL,
  cancelled_at   DATETIME     NULL,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_registration (event_id, user_id),          -- prevents duplicate registrations
  KEY idx_reg_event_status (event_id, status),
  KEY idx_reg_user (user_id),
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id    INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  status      ENUM('present','absent') NOT NULL,
  marked_by   INT UNSIGNED NULL,
  marked_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance (event_id, user_id),
  KEY idx_attendance_user (user_id),
  CONSTRAINT fk_att_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_marker FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id    INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  comments    VARCHAR(1000) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback (event_id, user_id),
  CONSTRAINT fk_fb_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_fb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_fb_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saved_events (
  user_id    INT UNSIGNED NOT NULL,
  event_id   INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  club_id     INT UNSIGNED NULL,
  event_id    INT UNSIGNED NULL,
  author_id   INT UNSIGNED NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ann_club (club_id, created_at),
  KEY idx_ann_event (event_id, created_at),
  CONSTRAINT fk_ann_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
  CONSTRAINT fk_ann_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_ann_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  type        VARCHAR(60)  NOT NULL,
  category    VARCHAR(40)  NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        VARCHAR(1000) NOT NULL,
  link        VARCHAR(255) NULL,
  dedupe_key  VARCHAR(190) NOT NULL,
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  read_at     DATETIME     NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notif_dedupe (user_id, dedupe_key),        -- idempotent notification generation
  KEY idx_notif_user_read (user_id, is_read, created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id             INT UNSIGNED NOT NULL,
  email_enabled       TINYINT(1) NOT NULL DEFAULT 1,
  sms_enabled         TINYINT(1) NOT NULL DEFAULT 0,
  pref_club_activity  TINYINT(1) NOT NULL DEFAULT 1,
  pref_event_updates  TINYINT(1) NOT NULL DEFAULT 1,
  pref_announcements  TINYINT(1) NOT NULL DEFAULT 1,
  pref_reminders      TINYINT(1) NOT NULL DEFAULT 1,
  pref_login_alerts   TINYINT(1) NOT NULL DEFAULT 0,       -- informational only; never blocks login
  pref_admin_activity TINYINT(1) NOT NULL DEFAULT 1,
  updated_at          TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id     INT UNSIGNED NULL,
  action       VARCHAR(80)  NOT NULL,
  entity_type  VARCHAR(60)  NULL,
  entity_id    VARCHAR(60)  NULL,
  metadata     JSON         NULL,
  ip           VARCHAR(64)  NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at),
  KEY idx_audit_actor (actor_id),
  KEY idx_audit_action (action),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key   VARCHAR(80)  NOT NULL,
  setting_value VARCHAR(1000) NOT NULL,
  updated_by    INT UNSIGNED NULL,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
