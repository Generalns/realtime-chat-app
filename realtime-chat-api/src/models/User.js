const db = require("./db");
const bcrypt = require("bcrypt");

class User {
  static createUser(username, phoneNumber, password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query =
      "INSERT INTO users (username, phoneNumber, password) VALUES (?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(query, [username, phoneNumber, hashedPassword], function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static getUserByPhoneNumber(phoneNumber) {
    const query = "SELECT * FROM users WHERE phoneNumber = ?";
    return new Promise((resolve, reject) => {
      db.get(query, [phoneNumber], (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row);
        }
      });
    });
  }

  static verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

module.exports = User;
