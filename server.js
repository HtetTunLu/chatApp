const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("user-name", (name) => {
    if (name) {
      const userFormat = {
        id: socket.id,
        name,
      };
      users.push(userFormat);
      io.emit("noti", `${name} has joined to this chat`);
      io.emit("total-users", users);
    }
  });
  socket.on("chat-message", (msg) => {
    const index = users.findIndex((user) => user.id === socket.id);
    if (index > -1) {
      console.log(`${users[index].name} type ${msg}`);
      io.emit("chat-message", msg, users[index].name);
    }
  });

  socket.on("disconnect", () => {
    const index = users.findIndex((user) => user.id === socket.id);
    if (index > -1) {
      io.emit("noti", `${users[index].name} has left from this chat`, true);
      users.splice(index, 1);
      io.emit("total-users", users, false);
    }
  });
});

server.listen(5000, "172.20.90.70", () => {
  console.log("listening on http://172.20.90.70:5000");
});
