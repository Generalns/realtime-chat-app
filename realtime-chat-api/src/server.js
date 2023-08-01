const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const frontendServer = process.env.FRONTEND_SERVER_URL;
const io = socketIO(server, {
  cors: {
    origin: frontendServer ? frontendServer : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 8080;
const cors = require("cors");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const Chat = require("./models/Chat");

// Middleware setup
app.use(
  cors({
    origin: frontendServer ? frontendServer : "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Use authentication routes
app.use("/auth", authRoutes);

// Check jwt token for handling api requests
app.use((req, res, next) => {
  // Extract token from cookies
  const token = req.cookies.token;
  // If no token was sent, return error
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  // Verify the token
  jwt.verify(token, "bebeaspirini", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token." });
    }
    req.userData = decoded;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("userTyping", (data) => {
    socket.broadcast.to(data.groupId).emit("userTyping", data);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.receiverId).emit("receivedMessage", data);
  });

  socket.on("userConnect", (userId) => {
    socket.join(parseInt(userId));
  });
  socket.on("readMsg", (data) => {
    const { receiverId, chatId } = data;
    Chat.updateChatReadStatus(receiverId, chatId)
      .then((result) => {
        io.to(receiverId).emit("read", receiverId);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  socket.on("receiverRead", (data) => {
    const { senderId, chatId } = data;
    io.to(senderId).emit("read", senderId);
  });
  socket.on("typing", (data) => {
    io.to(data.user).emit("typing", data);
  });
  socket.on("stop typing", (data) => {
    io.to(data.user).emit("stop typing", data);
  });
  socket.on("newChat", (userId) => {
    io.to(userId).emit("newChat");
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });
});
app.use("/chat", chatRoutes);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
