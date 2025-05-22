 CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  user_id INTEGER NOT NULL REFERENCES users(id),
  channel_id INTEGER NOT NULL REFERENCES channels(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  channel_id INTEGER NOT NULL REFERENCES channels(id),
  created_at TIMESTAMP DEFAULT NOW()
); 