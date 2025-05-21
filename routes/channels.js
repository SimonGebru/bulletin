const express = require("express");
const router = express.Router();
const db = require("../db/index");

// Hämta alla kanaler (behåll denna!)
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM channels ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte hämta kanaler" });
  }
});

router.post("/", async (req, res) => {
  const { name, ownerId } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO channels (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, ownerId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte skapa kanal" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await db.query(
      "UPDATE channels SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte uppdatera kanal" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM channels WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte radera kanal" });
  }
});

router.get("/:id/messages", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT m.*, u.username AS author FROM messages AS m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fel vid hämtning av meddelanden:", err);
    res.status(500).json({ error: "Kunde inte hämta meddelanden" }); //ändrade u.name > u.username eftersom det var med i tablen som simon skickade. Samt andra vissa små saker som var fel för mig i query...!
  }
});

module.exports = router;
