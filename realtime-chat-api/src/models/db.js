// src/models/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "./chat-app.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});
const createUserTable = () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      phoneNumber TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `;

  db.run(createUserTableQuery, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Users table created successfully.");
    }
  });
};

// Function to create the Message table
const createMessageTable = () => {
  const createMessageTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      chatId INTEGER NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users (id),
      FOREIGN KEY (receiverId) REFERENCES users (id),
      FOREIGN KEY (chatId) REFERENCES chat (id)
    )
  `;

  db.run(createMessageTableQuery, (err) => {
    if (err) {
      console.error("Error creating messages table:", err.message);
    } else {
      console.log("Messages table created successfully.");
    }
  });
};

// Function to create the Chat table
const createChatTable = () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS chat (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (senderId) REFERENCES users (id),
      FOREIGN KEY (receiverId) REFERENCES users (id)
    )
  `;

  db.run(createUserTableQuery, (err) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Chat table created successfully.");
    }
  });
};

// Create User and Message tables
createUserTable();
createMessageTable();
createChatTable();
module.exports = db;
