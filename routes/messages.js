const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { content, userId, channelId } = req.body;

  if (!content || !userId || !channelId) {
    return res.status(400).json({ error: 'Innehåll, användar-ID och kanal-ID krävs' });
  }

  try {
    // Step 1: Check if user is subscribed to the channel
    const subResult = await db.query(
      `SELECT 1 FROM subscriptions WHERE user_id = $1 AND channel_id = $2`,
      [userId, channelId]
    );

    if (subResult.rowCount === 0) {
      return res.status(403).json({ error: 'Användaren är inte prenumererad på kanalen' });
    }

    // Step 2: Insert the message
    const result = await db.query(
      `INSERT INTO messages (content, user_id, channel_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [content, userId, channelId]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Fel vid skapande av meddelande:', err);
    res.status(500).json({ error: 'Kunde inte skapa meddelande' });
  }
});

module.exports = router;