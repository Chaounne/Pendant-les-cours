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


 
  
  // Handle incoming WebSocket connections
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle incoming messages from clients
    socket.on('message', (data) => {
      //console.log('Message from client:', data);
      
      console.log(data.action);
     
      if(data.action === "grabCoinAttempt"){
       attemptGrabCoin(data.x,data.y,data.playerRef,data.key);
      }else if(data.action === "Co"){
        connectedUser(data.user);
        socket.emit('response',{message: playerRef});
      }else if(data.action === "htmlElements"){
        gameContainer = data.gameContainer;
        playerNameInput = data.playerNameInput;
        playerColorButton = data.playerColorButton;
        messageInput = data.messageInput;
        leaderboardContainer = data.leaderboardContainer;
        playerColors = data.playerColors;
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
  
  
  function attemptGrabCoin(x,y,playerRef,key,players){
    firebase.database().ref(`coins/${key}`).remove();
    
      playerRef.update({
     
        coins: players[playerId].coins + 1,
      })
      playerHistoryRef.update({
        coins: players[playerId].coins,
      })
  
  }
  function getKeyString(x, y) {
    return `${x}x${y}`;
  }
// Check if the player is in the database
// isPlayerInDatabase(playerId).then((isInDatabase) => {
//   if (isInDatabase) {
//   playerHistoryRef = firebase.database().ref(`players_history/${playerId}`);
//   // get the number of coins and the name of the player from the database to the PlayerRef
//   playerHistoryRef.once("value", (snapshot) => {
//     const playerHistory = snapshot.val();
//     playerRef.update({
//       id: playerId,
//       name: playerHistory.name,
//       coins: playerHistory.coins,
//       color: playerHistory.color,
//       x,
//       y,
//     })
//   })
//   return;
//   }
// })



function connectedUser(user){

  playerId = user.uid;
  const {x, y} = getRandomSafeSpot();
  playerRef = firebase.database().ref(`players/${playerId}`);

  const name = createName();
  playerNameInput.value = name;




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
}



function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Generate random name
function createName() {
	const prefix = randomFromArray([
		"GROS",
		"MINI",
		"SHINY",
		"PRECIEUX",
		"SUPER",
		"COOL",
		"BUCKET",
		"AMONG",
		"CRINGE",
		"MEDIOCRE",
		"RICHE",
		"MA",
		"MON",
		"TES",
		"TON",
		"TA",
		"HYPER",
	]);
	const animal = randomFromArray([
		"SUS",
		"US",
		"STEVE",
		"ROB",
		"MERE",
		"PERE",
		"FRERE",
		"MONOCLE",
		"DRAGON",
		"LOUIS",
		"REMS",
		"GYATZ",
		"JSP",
		"PROCESSEUR",
		"EXTRA LARGE",
	]);
	return `${prefix} ${animal}`;
}


function getRandomSafeSpot() {
	// We don't look things up by key here, so just return an x/y
	return randomFromArray([
		{ x: 1, y: 4 },
		{ x: 2, y: 4 },
		{ x: 1, y: 5 },
		{ x: 2, y: 6 },
		{ x: 2, y: 8 },
		{ x: 2, y: 9 },
		{ x: 4, y: 8 },
		{ x: 5, y: 5 },
		{ x: 5, y: 8 },
		{ x: 5, y: 10 },
		{ x: 5, y: 11 },
		{ x: 11, y: 7 },
		{ x: 12, y: 7 },
		{ x: 13, y: 7 },
		{ x: 13, y: 6 },
		{ x: 13, y: 8 },
		{ x: 7, y: 6 },
		{ x: 7, y: 7 },
		{ x: 7, y: 8 },
		{ x: 8, y: 8 },
		{ x: 10, y: 8 },
		{ x: 8, y: 8 },
		{ x: 11, y: 4 },
	]);
}
function isPlayerInDatabase(uid) {
	return firebase.database().ref(`players_history/${uid}`).once("value").then((snapshot) => {
		return snapshot.val() !== null;
	})
}


// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
