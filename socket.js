const server = require('http').createServer();
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté avec l\'ID :', socket.id);
  module.exports = socket;


});



server.listen(4000);

module.exports.io = io;