const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', usersRouter); // Din första route

const PORT = process.env.PORT || 4000;
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Databasanslutning misslyckades:', err);
  } else {
    console.log('✅ Databasen är ansluten! Nu är det:', res.rows[0].now);
  }
});
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});