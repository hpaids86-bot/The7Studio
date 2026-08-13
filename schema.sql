-- Cloudflare D1 Database Schema for The7Studio Booking System

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  preferred_time TEXT,
  location TEXT,
  package TEXT,
  hours TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending'
);

-- Index for searching and filtering by status and date
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
