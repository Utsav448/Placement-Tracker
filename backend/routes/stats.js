const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/stats -> admin-only summary numbers for the placement season
router.get('/', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
  const [[{ totalCompanies }]] = await pool.query('SELECT COUNT(*) AS totalCompanies FROM companies');
  const [[{ totalDrives }]] = await pool.query('SELECT COUNT(*) AS totalDrives FROM drives');
  const [[{ totalApplications }]] = await pool.query('SELECT COUNT(*) AS totalApplications FROM applications');

  const [[{ studentsPlaced }]] = await pool.query(
    `SELECT COUNT(DISTINCT student_id) AS studentsPlaced FROM applications WHERE status = 'Selected'`
  );

  const placementPercentage = totalStudents > 0
    ? ((studentsPlaced / totalStudents) * 100).toFixed(1)
    : '0.0';

  const [byCompany] = await pool.query(`
    SELECT companies.name AS company_name, COUNT(applications.id) AS selected_count
    FROM applications
    JOIN drives ON applications.drive_id = drives.id
    JOIN companies ON drives.company_id = companies.id
    WHERE applications.status = 'Selected'
    GROUP BY companies.id, companies.name
    ORDER BY selected_count DESC
  `);

  res.json({
    totalStudents,
    totalCompanies,
    totalDrives,
    totalApplications,
    studentsPlaced,
    placementPercentage,
    byCompany
  });
}));

module.exports = router;
