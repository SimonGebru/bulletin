
const express = require('express');
const router = express.Router();
const pool = require('../db');

//Enbart för frontend och inte ett krav för upg
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Användaren finns inte" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fel vid hämtning av användare:", err);
    res.status(500).json({ message: "Serverfel" });
  }
});

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