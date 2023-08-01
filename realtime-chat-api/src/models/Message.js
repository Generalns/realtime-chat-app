const db = require("./db");

class Message {
  static createMessage(senderId, receiverId, chatId, content) {
    const query =
      "INSERT INTO messages (senderId, receiverId, chatId, content) VALUES (?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(query, [senderId, receiverId, chatId, content], function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static getMessagesByUserIds(userId1, userId2) {
    const query =
      "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC";
    return new Promise((resolve, reject) => {
      db.all(query, [userId1, userId2, userId2, userId1], (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Message;
