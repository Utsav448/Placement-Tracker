// Handles: student registration, and login for BOTH students and admins.

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// POST /api/auth/register  -> a new student creates an account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, roll_no, branch, cgpa, resume_link } = req.body;

    if (!name || !email || !password || !roll_no || !branch || !cgpa) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Never store the raw password - hash it first
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO students (name, email, password, roll_no, branch, cgpa, resume_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, roll_no, branch, cgpa, resume_link || null]
    );

    res.status(201).json({ message: 'Registered successfully. You can now log in.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login  -> role is 'student' or 'admin', sent from the frontend toggle
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const table = role === 'admin' ? 'admins' : 'students';

    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Token carries id + role so every future request knows who's asking
    const token = jwt.sign({ id: user.id, role: role === 'admin' ? 'admin' : 'student' }, process.env.JWT_SECRET, {
      expiresIn: '2d'
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role === 'admin' ? 'admin' : 'student',
        cgpa: role === 'admin' ? null : user.cgpa
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
