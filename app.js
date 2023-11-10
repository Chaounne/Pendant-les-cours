

const mapData = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "4x7": true,
    "5x7": true,
    "6x7": true,
    "8x6": true,
    "9x6": true,
    "10x6": true,
    "7x9": true,
    "8x9": true,
    "9x9": true,
  },
};

const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

//Misc Helpers
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}

//Check if a player uid is in the database
function isPlayerInDatabase(uid) {
  return firebase.database().ref(`players_history/${uid}`).once("value").then((snapshot) => {
    return snapshot.val() !== null;
  })
}



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

function isSolid(x,y) {

  const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
  return (
      blockedNextSpace ||
      x >= mapData.maxX ||
      x < mapData.minX ||
      y >= mapData.maxY ||
      y < mapData.minY
  )
}

function getRandomSafeSpot() {
  //We don't look things up by key here, so just return an x/y
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


(function () {

  let playerId;
  let playerRef;
  let playerHistoryRef;
  let players = {};
  let playerElements = {};
  let coins = {};
  let coinElements = {};
  let chatRef;

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  const playerColorButton = document.querySelector("#player-color");
  const messageInput = document.querySelector("#chat-message");
  const chatContainer = document.querySelector(".chat-container");
  const chatButton = document.querySelector("#chat-button");
  const leaderboardContainer = document.querySelector(".leaderboard-container");

  //Put the 5 richest players in the leaderboard-container, the players are in the database in the players_history section
  function updateLeaderboard() {
    const leaderboardRef = firebase.database().ref("players_history");
    leaderboardRef.once("value").then((snapshot) => {
      const leaderboard = snapshot.val();
      const sortedLeaderboard = Object.entries(leaderboard)
          .sort((a, b) => b[1].coins - a[1].coins)
          .slice(0, 5);

      let leaderboardHTML = "";
      let i = 0;
      for (let [uid, player] of sortedLeaderboard) {
        i++;
        leaderboardHTML += `
        <div class="leaderboard-player">
          <div class="leaderboard-infos"> ${i} - ${player.name} : ${player.coins} Pièces</div>
        </div>
      `;
      }
      leaderboardContainer.innerHTML = leaderboardHTML;
    });
  }


  function placeCoin() {
    const { x, y } = getRandomSafeSpot();
    const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
    coinRef.set({
      x,
      y,
    })

    const coinTimeouts = [2000, 3000, 4000, 5000];
    setTimeout(() => {
      placeCoin();
    }, randomFromArray(coinTimeouts));
  }

  function attemptGrabCoin(x, y) {
    const key = getKeyString(x, y);
    if (coins[key]) {
      // Remove this key from data, then uptick Player's coin count
      firebase.database().ref(`coins/${key}`).remove();
      playerRef.update({
        coins: players[playerId].coins + 1,
      })
      playerHistoryRef.update({
        coins: players[playerId].coins,
      })
    }
  }


  function handleArrowPress(xChange=0, yChange=0) {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
    if (!isSolid(newX, newY)) {
      //move to the next space
      players[playerId].x = newX;
      players[playerId].y = newY;
      if (xChange === 1) {
        players[playerId].direction = "right";
      }
      if (xChange === -1) {
        players[playerId].direction = "left";
      }
      playerRef.set(players[playerId]);
      attemptGrabCoin(newX, newY);
    }
  }

  function initGame() {

    updateLeaderboard();

    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))

    document.getElementById("upButton").addEventListener("click", () => handleArrowPress(0, -1));
document.getElementById("downButton").addEventListener("click", () => handleArrowPress(0, 1));
document.getElementById("leftButton").addEventListener("click", () => handleArrowPress(-1, 0));
document.getElementById("rightButton").addEventListener("click", () => handleArrowPress(1, 0));


    const allPlayersRef = firebase.database().ref(`players`);
    const allCoinsRef = firebase.database().ref(`coins`);
    const allChatRef = firebase.database().ref(`chat`);

    allPlayersRef.on("value", (snapshot) => {
      //Fires whenever a change occurs
      players = snapshot.val() || {};
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        // Now update the DOM
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_coins").innerText = characterState.coins;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      })

    })
    allPlayersRef.on("child_added", (snapshot) => {
      //Fires whenever a new node is added the tree
      const addedPlayer = snapshot.val();
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if (addedPlayer.id === playerId) {
        characterElement.classList.add("you");
      }
      characterElement.innerHTML = (`
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell"></div>
        <div class="Character_name-container">
          <span class="Character_name"></span>
          <span class="Character_coins">0</span>
        </div>
        <div class="Character_you-arrow"></div>
      `);
      playerElements[addedPlayer.id] = characterElement;

      //Fill in some initial state
      characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
      characterElement.querySelector(".Character_coins").innerText = addedPlayer.coins;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      gameContainer.appendChild(characterElement);
    })


    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    })


    //This block will remove coins from local state when Firebase `coins` value updates
    allCoinsRef.on("value", (snapshot) => {
      coins = snapshot.val() || {};
      updateLeaderboard();
    });
    //

    allCoinsRef.on("child_added", (snapshot) => {
      const coin = snapshot.val();
      const key = getKeyString(coin.x, coin.y);
      coins[key] = true;

      // Create the DOM Element
      const coinElement = document.createElement("div");
      coinElement.classList.add("Coin", "grid-cell");
      coinElement.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="Coin_sprite grid-cell"></div>
      `;

      // Position the Element
      const left = 16 * coin.x + "px";
      const top = 16 * coin.y - 4 + "px";
      coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      // Keep a reference for removal later and add to DOM
      coinElements[key] = coinElement;
      gameContainer.appendChild(coinElement);
    })
    allCoinsRef.on("child_removed", (snapshot) => {
      const {x,y} = snapshot.val();
      const keyToRemove = getKeyString(x,y);
      gameContainer.removeChild( coinElements[keyToRemove] );
      delete coinElements[keyToRemove];
    })


    //Updates player name with text input
    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      playerNameInput.value = newName;
      playerRef.update({
        name: newName
      })
      playerHistoryRef.update({
        name: newName
      })
    })

    chatButton.addEventListener("click", () => {
      //get the message from the input, message = username + message
      const newMessage = `${players[playerId].name}: ${messageInput.value}`;
      //if the message is empty, don't send it
      if (!messageInput.value || messageInput.value === "") {
        return;
      }
      chatRef = firebase.database().ref(`chat`);
      chatRef.push(newMessage);
      messageInput.value = "";
    })

    allChatRef.on("child_added", (snapshot) => {
        const newMessage = snapshot.val();
        const messageElement = document.createElement("div");
        messageElement.classList.add("Message");
        messageElement.innerText = newMessage;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    })

    //Update player color on button click
    playerColorButton.addEventListener("click", () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      playerRef.update({
        color: nextColor
      })
      playerHistoryRef.update({
        color: nextColor
      })
    })

    //Place my first coin
    placeCoin();

  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      //Logged in!
      playerId = user.uid;
      playerRef = firebase.database().ref(`players/${playerId}`);

      const name = createName();
      playerNameInput.value = name;

      const {x, y} = getRandomSafeSpot();

      //Check if the player is in the database
        isPlayerInDatabase(playerId).then((isInDatabase) => {
            if (isInDatabase) {
            playerHistoryRef = firebase.database().ref(`players_history/${playerId}`);
            //get the number of coins and the name of the player from the database to the PlayerRef
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
            //Add the player to the database players_history and players
              firebase.database().ref(`players_history/${playerId}`).set({
              id: playerId,
              name,
              direction: "right",
              color: randomFromArray(playerColors),
              x,
              y,
              coins: 0,
            })
            //If the player is not in the database, create a new player
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

      //Save data to the database when the player leaves
      playerRef.onDisconnect().remove();

      //Begin the game now that we are signed in
      initGame();
    } else {
      //Logged out.
    }
  })

  firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
  });


})();
// Sélectionnez le bouton et le conteneur du tchat
const openChatButton = document.getElementById('openChatButton');
const chatContainer = document.querySelector('.chat');

// Initialisez une variable pour suivre l'état du tchat
let isChatOpen = false;

// Ajoutez un écouteur d'événements sur le clic du bouton
openChatButton.addEventListener('click', () => {
  // Inversez l'état du tchat
  isChatOpen = !isChatOpen;

  // Mettez à jour le texte du bouton en fonction de l'état
  openChatButton.innerHTML = isChatOpen ? '<i class="fas fa-comment"></i>  ' : '<i class="fas fa-comment"></i>  ';

  // Affichez ou masquez le conteneur du tchat en fonction de l'état
  chatContainer.style.display = isChatOpen ? 'flex' : 'none';
});
