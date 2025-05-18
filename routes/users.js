
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /users – skapa en ny användare
router.post('/', async (req, res) => {
  const { username, email } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username krävs' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [username, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Fel vid skapande av användare:', err);
    res.status(500).json({ error: 'Något gick fel vid skapandet' });
  }
});

module.exports = router;