const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");

router.get("/messages/:senderId/:receiverId", (req, res) => {
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;
  if (!senderId || !receiverId) {
    console.log("Not user");
    return res.status(400).json({ error: "Invalid request data." });
  }
  Message.getMessagesByUserIds(senderId, receiverId)
    .then((result) => {
      res.status(200).json({ messages: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    console.log("Not user");
    return res.status(400).json({ error: "Invalid request data." });
  }
  Chat.getChats(userId).then((result) => {
    res.status(200).json({ chats: result });
  });
});

router.post("/private/chat/readMessages", (req, res) => {
  const { receiverId, chatId } = req.body;
  Chat.updateChatReadStatus(receiverId, chatId)
    .then((result) => {
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/private/chat/:recieverId", (req, res) => {
  const receiverId = req.params.recieverId;
  const { senderId } = req.body;
  console.log("recieverId", req.params);
  Chat.getChat(senderId, receiverId).then((result) => {
    console.log("Does chat exist", result);
    if (result) {
      res.status(400).json({ err: "Chat already exists" });
    } else {
      console.log("Chat doesnt exist I am gonna create");
      Chat.createChat(senderId, receiverId)
        .then((result) => {
          console.log("Result", result);
          res.status(200).json({ message: "Succesfull chat creation" });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});
router.post("/private/:receiverId", (req, res) => {
  const { receiverId } = req.params;
  const { senderId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).json({ error: "Invalid request data." });
  }
  Chat.getChat(receiverId, senderId)
    .then((result) => {
      if (result) {
        Message.createMessage(senderId, receiverId, result.id, message)
          .then((messageId) => {
            return res.status(201).json({
              message: "Private message sent successfully.",
              messageId,
            });
          })
          .catch((error) => {
            return res
              .status(500)
              .json({ error: "Failed to send private message." });
          });
      } else {
        Chat.createChat(senderId, receiverId)
          .then((result) => {
            console.log("Result", result);
            Message.createMessage(senderId, receiverId, result, message)
              .then((messageId) => {
                return res.status(201).json({
                  message: "Private message sent successfully.",
                  messageId,
                });
              })
              .catch((error) => {
                console.log(error);
                return res
                  .status(500)
                  .json({ error: "Failed to send private message." });
              });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
