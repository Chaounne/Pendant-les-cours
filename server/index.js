const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let playerId;
let playerRef;

let coins = {};
let coinElements = {};

// Serve static files from the 'front-end' directory

// Define a route to handle the initial HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Handle incoming WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages from clients
  socket.on('message', (data) => {
    console.log('Message from client:', data);

    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  function getKeyString(x, y) {
    return `${x}x${y}`;
  }
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
   // Handle coin grabbing attempt
 socket.on('attemptGrabCoin', (coordinates) => {
  console.log('Coin s attempt at coordinates:', coordinates);


    // Remove this key from data, then uptick Player's coin count
    firebase.database().ref(`coins/${key}`).remove();
    playerRef.update({
      coins: players[playerId].coins + 1,
      
    });
    
    playerHistoryRef.update({
      coins: players[playerId].coins,
    });
  
});

});



// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
