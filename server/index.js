const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let players= {};

const firebase = require('firebase');


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

function launchBD(user){

  firebase.auth().onAuthStateChanged((user) => {
    console.log("1");
    if (user) {
      console.log("GG");
      // Logged in!
      playerId = user.uid;
      playerRef = firebase.database().ref(`players/${playerId}`);
  
      const name = createName();
      playerNameInput.value = name;
  
      const {x, y} = getRandomSafeSpot();
  
      // Check if the player is in the database
      isPlayerInDatabase(playerId).then((isInDatabase) => {
        if (isInDatabase) {
        playerHistoryRef = firebase.database().ref(`players_history/${playerId}`);
        // get the number of coins and the name of the player from the database to the PlayerRef
        playerHistoryRef.once("value", (snapshot) => {
          const playerHistory = snapshot.val();
          playerRef.update({
            id: playerId,
            name: playerHistory.name,
            coins: playerHistory.coins,
            color: playerHistory.color,
            x,
            y,
          })
        })
        return;
        }
        // Add the player to the database players_history and players
        firebase.database().ref(`players_history/${playerId}`).set({
          id: playerId,
          name,
          direction: "right",
          color: randomFromArray(playerColors),
          x,
          y,
          coins: 0,
        })
        // If the player is not in the database, create a new player
        playerRef.set({
          id: playerId,
          name,
          direction: "right",
          color: randomFromArray(playerColors),
          x,
          y,
          coins: 0,
        })
      })
      
      // Save data to the database when the player leaves
      playerRef.onDisconnect().remove();
  }})
  
  // Handle incoming WebSocket connections
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle incoming messages from clients
    socket.on('message', (data) => {
      console.log('Message from client:', data);
      
      console.log(data.action);
      if(data.action ==="Player"){
        console.log(data.user);
        launchBD(data.user);
        console.log("testtt");
      }else if(data.action === "grabCoinAttempt"){
        console.log(  data.playerRef);
        console.log( data.playerHistoryRef);
        console.log(data.x,data.y);
       attemptGrabCoin(data.x,data.y,data.playerRef,data.key);
      }
  
      // Broadcast the message to all connected clients
      io.emit('message', data);
  
      // Additional backend processing based on 'data' can be done here
      // ...
  
      // Send a response back to the client if needed
      socket.emit('response', { message: data.action });
    });
  
     
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
  
  
  function attemptGrabCoin(x,y,playerRef,key){
    firebase.database().ref(`coins/${key}`).remove();
      playerRef.update({
      
        coins: players[playerId].coins + 1,
      })
      playerHistoryRef.update({
        coins: players[playerId].coins,
      })
  
  }
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}



// function attemptGrabCoin(x,y) {
// 	const key = getKeyString(x, y);
// 	if (coins[key]) {
// 		// Remove this key from data, then uptick Player's coin count
// 		firebase.database().ref(`coins/${key}`).remove();
// 		playerRef.update({
// 			coins: players[playerId].coins + 1,
// 		})
// 		playerHistoryRef.update({
// 			coins: players[playerId].coins,
// 		})
		

	
// 	}
// }









// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
