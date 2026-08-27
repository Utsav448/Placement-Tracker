-- Student Placement Tracker - Database Schema
-- Run this once against your MySQL server to set everything up.

CREATE DATABASE IF NOT EXISTS placement_tracker;
USE placement_tracker;

-- 1. Students who log in and apply to drives
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,       -- stored as a bcrypt hash, never plain text
  roll_no VARCHAR(50) NOT NULL,
  branch VARCHAR(50) NOT NULL,
  cgpa DECIMAL(3,2) NOT NULL,
  resume_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Placement officers / admins who manage drives
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Companies that visit campus
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Drives = a specific hiring round run by a company
CREATE TABLE drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  role VARCHAR(100) NOT NULL,
  package_offered VARCHAR(50),
  min_cgpa DECIMAL(3,2) DEFAULT 0,
  drive_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 5. Applications = a student applying to a drive (many-to-many link table)
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  status ENUM('Applied', 'Shortlisted', 'Selected', 'Rejected') DEFAULT 'Applied',
  applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (student_id, drive_id)  -- a student can't apply twice to the same drive
);

-- 6. Saved / favourited drives - a student bookmarking a drive to apply to later
CREATE TABLE saved_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE,
  UNIQUE KEY unique_save (student_id, drive_id)
);

-- Seed one admin account so you can log in immediately.
-- Email: admin@placement.com | Password: admin123
-- (password below is the bcrypt hash of "admin123")
INSERT INTO admins (name, email, password) VALUES
('Placement Officer', 'admin@placement.com', '$2a$10$iDHeQIxl6FsqXVncNPDHY.hYEQjF3K7fZqqiFYsUgIYOu/l970UAW');
