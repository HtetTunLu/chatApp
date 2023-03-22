const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.static("public"));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = [];
const messages = [];
let msg_id = 0;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/session", (req, res) => {
  res.sendFile(__dirname + "/session.html");
});

io.on("connection", (socket) => {
  socket.on("user-name", (name) => {
    if (name) {
      const userFormat = {
        id: socket.id,
        name,
      };
      users.push(userFormat);
      messages.push({
        id: msg_id,
        msg: `${name} has joined to this chat`,
        isMsg: false,
        isJoin: true,
      });
      io.emit("chat-message", messages);
      io.emit("total-users", users);
    }
  });

  socket.on("chat-message", (msg, messageId) => {
    msg_id += 1;
    if (messageId === undefined) {
      messages.push({ id: msg_id, msg, isMsg: true });
      io.emit("chat-message", messages);
    } else {
      messages.map((e) => {
        if (e.id === messageId && !e.replyMsg) {
          e.replyMsg = [msg];
        } else if (e.id === messageId && e.replyMsg.length > 0) {
          e.replyMsg.push(msg);
        }
        return e;
      });
      io.emit("chat-message", messages);
      io.emit("replyed");
    }
  });

  socket.on("file-message", (file, messageId) => {
    msg_id += 1;
    if (messageId === undefined) {
      messages.push({ id: msg_id, file, isMsg: true });
      io.emit("chat-message", messages);
    } else {
      messages.map((e) => {
        if (e.id === messageId && !e.replyMsg) {
          e.replyMsg = [file];
          e.replyImg = true;
        } else if (e.id === messageId && e.replyMsg.length > 0) {
          e.replyMsg.push(file);
          e.replyImg = true;
        }
        return e;
      });
      io.emit("chat-message", messages);
      io.emit("replyed");
    }
  });

  socket.on("disconnect", () => {
    const index = users.findIndex((user) => user.id === socket.id);
    if (index > -1) {
      messages.push({
        id: msg_id,
        msg: `${users[index].name} has left from this chat`,
        isMsg: false,
        isJoin: false,
      });
      io.emit("log-out", true);
      io.emit("chat-message", messages);
      users.splice(index, 1);
      io.emit("total-users", users, false);
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
