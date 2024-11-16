const express = require("express");
const connectDB = require("./config/Database");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chats");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("message", ({ inputValue, room }) => {
    io.to(room).emit("receive message", inputValue);
  });
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

connectDB
  .then(() => {
    console.log("Database Successfully Connected...");
    server.listen(7777, () => {
      console.log("Server is successfully started on port 7777");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connect ", err);
  });
