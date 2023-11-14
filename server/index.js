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
 src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"
 src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"

      const firebaseConfig = {
        apiKey: "AIzaSyA_9v6IEVYlvDtVT8QUuMJTkbyotjNBlyU",
        authDomain: "pendant-les-cours.firebaseapp.com",
        databaseURL: "https://pendant-les-cours-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "pendant-les-cours",
        storageBucket: "pendant-les-cours.appspot.com",
        messagingSenderId: "121450160778",
        appId: "1:121450160778:web:7838eb4a5dc89559d7c373"
      };
      firebase.initializeApp(firebaseConfig);
  

app.use(express.static(path.join(__dirname, 'front-end')));
// Define a route to handle the initial HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/front-end/index.html'));
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
