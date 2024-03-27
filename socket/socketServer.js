const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
  const existingUserIndex = onlineUsers.findIndex(
    (user) => user.userId === userId
  );

  if (existingUserIndex !== -1) {
    onlineUsers[existingUserIndex].socketId = socketId;
  } else {
    onlineUsers.push({ userId, socketId });
  }
};
const removeUser = (socketId) => {
  const userIndex = onlineUsers.findIndex((user) => user.socketId === socketId);
  if (userIndex !== -1) {
    onlineUsers[userIndex].socketId = null;
  }
};
const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};
io.on("connection", function (socket) {
  console.log("a user connected");
  console.log(socket.id);

  socket.on("userLoggedIn", (userId) => {
    addNewUser(userId, socket.id);
console.log('onlineUsers: ', onlineUsers);

  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("a user disconnected");
  });
});

module.exports = { io, onlineUsers };

