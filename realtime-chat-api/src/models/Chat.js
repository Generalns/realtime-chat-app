const db = require("./db");

class Chat {
  static createChat(senderId, receiverId) {
    const query = "INSERT INTO chat (senderId, receiverId) VALUES (?, ?)";
    return new Promise((resolve, reject) => {
      db.run(query, [senderId, receiverId], function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static getChat(userId1, userId2) {
    const query =
      "SELECT * FROM chat WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC";
    return new Promise((resolve, reject) => {
      db.get(query, [userId1, userId2, userId2, userId1], (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
  }
  static updateChatReadStatus(receiverId, chatId) {
    const query =
      "UPDATE messages SET isRead = 1 WHERE receiverId = ? AND chatId = ?;";

    return new Promise((resolve, reject) => {
      db.run(query, [receiverId, chatId], function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve({
            message: "Chat read status updated successfully.",
            rowsAffected: this.changes,
          });
        }
      });
    });
  }

  static getChats(userId) {
    const query = `SELECT 
      c.*, us.username as senderUsername, us.phoneNumber as senderPhoneNumber, ur.username as receiverUsername, 
      ur.phoneNumber as receiverPhoneNumber, lastMessage.content as lastMessageContent, 
      COALESCE(lastMessage.timestamp, c.timestamp) as maxTimestamp, 
      COALESCE((SELECT COUNT(*) FROM messages WHERE isRead = 0 
      AND receiverId = c.senderId AND chatId = c.id), 0) as unreadMessagesForSender, 
      COALESCE((SELECT COUNT(*) FROM messages WHERE isRead = 0 
      AND receiverId = c.receiverId AND chatId = c.id), 0) as unreadMessagesForReceiver 
      FROM chat c 
      LEFT JOIN (SELECT m1.chatId, m1.content, m1.timestamp 
      FROM messages m1 
      WHERE m1.timestamp = (SELECT MAX(m2.timestamp) 
      FROM messages m2 WHERE m1.chatId = m2.chatId)) AS lastMessage ON c.id = lastMessage.chatId 
      LEFT JOIN users us ON us.id = c.senderId 
      LEFT JOIN users ur ON ur.id = c.receiverId 
      WHERE (c.senderId = ? ) OR (c.receiverId = ?) ORDER BY maxTimestamp DESC;`;
    return new Promise((resolve, reject) => {
      db.all(query, [userId, userId], (err, rows) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Chat;
