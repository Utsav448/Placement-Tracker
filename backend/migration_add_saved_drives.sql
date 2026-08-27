-- Run this ONLY if you already set up your database before (i.e. you already
-- ran schema.sql once). This just adds the one new table for Saved Drives
-- without touching your existing data.

USE placement_tracker;

CREATE TABLE IF NOT EXISTS saved_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  drive_id INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE,
  UNIQUE KEY unique_save (student_id, drive_id)
);
