const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/companies -> anyone logged in can view the list of companies
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
  res.json(rows);
}));

// POST /api/companies -> only an admin can add a new company
router.post('/', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Company name is required.' });

  const [result] = await pool.query(
    'INSERT INTO companies (name, description) VALUES (?, ?)',
    [name, description || '']
  );
  res.status(201).json({ id: result.insertId, name, description });
}));

// PUT /api/companies/:id -> admin edits a company's name/description
router.put('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Company name is required.' });

  await pool.query('UPDATE companies SET name = ?, description = ? WHERE id = ?', [name, description || '', req.params.id]);
  res.json({ message: 'Company updated.' });
}));

// DELETE /api/companies/:id -> admin removes a company
// Deleting a company also removes its drives, and any applications/saves tied
// to those drives, because of ON DELETE CASCADE in the database schema.
router.delete('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
  res.json({ message: 'Company deleted.' });
}));

// PUT /api/companies/:id -> admin edits a company's details
router.put('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Company name is required.' });

  await pool.query('UPDATE companies SET name = ?, description = ? WHERE id = ?', [name, description || '', req.params.id]);
  res.json({ message: 'Company updated.' });
}));

// DELETE /api/companies/:id -> admin removes a company
// Note: this cascades - any drives under this company, and every application
// or saved-drive tied to those drives, get deleted too (set up via ON DELETE
// CASCADE in the schema). The frontend warns about this before calling it.
router.delete('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
  res.json({ message: 'Company deleted.' });
}));

module.exports = router;
