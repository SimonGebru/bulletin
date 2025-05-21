const express = require('express');
const router = express.Router();
const db = require ('../db/index')

//enbart för frontend
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await db.query(
        `SELECT c.* FROM subscriptions s
         JOIN channels c ON s.channel_id = c.id
         WHERE s.user_id = $1`,
        [userId]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error("Fel vid hämtning av prenumerationer:", err);
      res.status(500).json({ error: "Serverfel" });
    }
  });

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