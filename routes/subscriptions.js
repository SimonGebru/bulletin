const express = require('express');
const router = express.Router();
const db = require ('../db/index')

router.post('/', async (req, res) => {
  const { userId, channelId } = req.body;
  try {
    await db.query(
      'INSERT INTO subscriptions (user_id, channel_id) VALUES ($1, $2)',
      [userId, channelId]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte prenumerera' });
  }
});

router.delete('/:userId/:channelId', async (req, res) => {
  const { userId, channelId } = req.params;
  try {
    await db.query(
      'DELETE FROM subscriptions WHERE user_id = $1 AND channel_id = $2',
      [userId, channelId]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte ta bort prenumeration' });
  }
});

module.exports = router;