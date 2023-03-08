import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import serveStatic from "serve-static";
import shuffle from "shuffle-array";
import socketIO from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(serveStatic(__dirname + "/client/dist"));

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});


let players = {};
let readyCheck = 0;
let gameState = "Initializing";
let selectorCheck = 0;
let selectedButton;
let playerCount = 0;
let roundCount = 0;
let lobbies = [];







function checkWinConditions(player1, player2, playerIds) {
  if (player1.score === 3) {
    io.to(playerIds[0]).emit("youWon");
    io.to(playerIds[1]).emit("youLost")
  }

  if (player2.score === 3) {
    io.to(playerIds[1]).emit("youWon");
    io.to(playerIds[0]).emit("youLost")
  }
}

// timer.interval = setInterval(() => {
//   if (timer.started === true) {
//   timer.remainingTime--;
//   io.emit('updateTimer', timer.remainingTime);
//   if (timer.remainingTime === 0) {
//     timer.remainingTime = 60;
//     io.emit('timesUp');
    
//   }
//   }

// }, 1000);







const demonCards = [];

for (let i = 1; i <= 666; i++) {
  demonCards.push(`demon${i}`);
}







io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);
    playerCount++;


   



    players[socket.id] = {
        inDeck: [],
        inHand: [],
        isPlayerA: false,
        playedCard: "none",
        cardAttack: 0,
        score: 0,
        lobbyId: null
    };

    socket.emit('lobbyList', lobbies);


  
 
    

    // let lobby = lobbies.find(lobby => lobby.players.length === 1);

    // if (!lobby) {
    //   lobby = {
    //     id: lobbies.length, // Generate a unique ID for the lobby
    //     players: [socket.id],
    //     gameState: 'Initializing',
    //     roundCount: 0,
    //     selectorCheck: 0,
    //     selectedButton,
    //     timer: {
    //       started: false,
    //       delay: 60000,
    //       remainingTime: 60,
    //       interval: null
    //     }
    //   };
    //   players[socket.id].isPlayerA = true;
    //   io.to(socket.id).emit('firstTurn');
    //   lobbies.push(lobby);
    // } else {
    //   lobby.players.push(socket.id);
    //   io.to(socket.id).emit('secondPlayerConnected');
    // }
  
    // players[socket.id].lobbyId = lobby.id;
    // socket.join(lobby.id);



    
  






    socket.on('createLobby', ({ name, bet }) => {

     socket.emit("changeScene", "Game");

      const lobby = {
        gameState: 'Initializing',
        roundCount: 0,
        selectorCheck: 0,
        selectedButton,
          id: lobbies.length,
          name: name,
          bet: bet,
          players: [socket.id],
          timer: {
                  started: false,
                  delay: 60000,
                  remainingTime: 60,
                  interval: null
                }
      };

      // lobby.timer.interval = setTimeout(function timer() {
      //   if (!lobby.timer.started) {
      //     clearTimeout(lobby.timer.interval);
      //     return;
      //   }
      
      //   lobby.timer.remainingTime--;
      //   io.to(lobby.id).emit('updateTimer', lobby.timer.remainingTime);
      //   if (lobby.timer.remainingTime === 0) {
      //     lobby.timer.remainingTime = 60;
      //     io.to(lobby.id).emit('timesUp');
      //   }
      
      //   lobby.timer.interval = setTimeout(timer, 1000);
      // }, 1000);
      

      lobbies.push(lobby);
      
      io.emit("lobbyList", lobbies)
     
      socket.join(lobby.id);
      setTimeout(() => {
      // io.to(lobby.id).emit("firstTurn");
      io.to(lobby.id).emit("firstTurn")
    }, 3000)
    console.log(lobby);
      
      console.log(`lobby Created with ID ${lobby.id}`);
  });





  socket.on('joinLobby', (lobbyId) => {
    const lobby = lobbies[lobbyId];
    if (lobby && lobby.players.length === 1) {
        lobby.players.push(socket.id);
        socket.emit("changeScene", "Game")
        socket.join(lobbyId);
        io.emit("lobbyList", lobbies);
        setTimeout(() => {
        socket.emit("secondPlayerConnected")
      }, 3000)
        // io.to(socket.id).emit("secondPlayerConnected")
        lobby.gameState = "Initializing"
        setTimeout(() => {
        io.to(lobby.id).emit('changeGameState', lobby.gameState);
      }, 3000)
    
    } else {
        // socket.emit('lobbyFull');
    }
});



    

    socket.on(`didntPlayCard`, () => {
      lobby.selectorCheck++;
      const playerIds = Object.keys(players);
      const player1 = players[playerIds[0]];
      const player2 = players[playerIds[1]];
  
      if (player1.cardAttack > player2.cardAttack) {
        setTimeout(() => {
          player1.score++;
          io.to(playerIds[0]).emit('updateScore', player1.score, player2.score, playerIds[0]);
          io.to(playerIds[1]).emit('updateScore', player2.score, player1.score, playerIds[0]); // exclude player 1 from receiving the event
          io.to(playerIds[0]).emit("destroyOpCard");
          io.to(playerIds[1]).emit("destroyMyCard");
        }, 4000);
        } else if (player2.cardAttack > player1.cardAttack) {
          setTimeout(() => {
          player2.score++;
          io.to(playerIds[1]).emit('updateScore', player2.score, player1.score, playerIds[1]);
          io.to(playerIds[0]).emit('updateScore', player1.score, player2.score, playerIds[1]); // exclude player 2 from receiving the event
          io.to(playerIds[1]).emit("destroyOpCard");
          io.to(playerIds[0]).emit("destroyMyCard");
        }, 4000)
        } else {
          
        }
    })




    // socket.on('dealCards', function (socketId) {
    //   players[socketId].inHand = [];
    //     for (let i = 0; i < 5; i++) {
          
    
    //         if (players[socketId].inDeck.length === 0) {
    //             players[socketId].inDeck = shuffle(demonCards);
    //         }
    //         players[socketId].inHand.push(players[socketId].inDeck.shift());
    //     }
    //     io.to(lobby.id).emit('dealCards', socketId, players[socketId].inHand);
    //     readyCheck++;
    //     if (readyCheck >= 2) {
    //         gameState = "Ready";
    //         lobby.timer.started = true;
    //           lobby.timer.remainingTime = 60;
    //         io.to(lobby.id).emit('changeGameState', "Ready");
    //         lobby.roundCount = 1;
    //     }
    // });


    socket.on('dealCards', function (socketId) {
      const lobby = lobbies.find(lobby => lobby.players.includes(socketId));
    
      if (lobby && lobby.gameState === "Initializing") {
        // const player = lobby.players.find(playerId => playerId === socketId);
        players[socketId].inHand === [];
    
        for (let i = 0; i < 5; i++) {
          if (players[socketId].inDeck.length === 0) {
            players[socketId].inDeck = shuffle(demonCards);
          }
          players[socketId].inHand.push(players[socketId].inDeck.shift());
        }
    
        io.to(lobby.id).emit('dealCards', socketId, players[socketId].inHand);
    
        lobby.selectorCheck++;
        if (lobby.selectorCheck >= lobby.players.length) {
          lobby.selectorCheck = 0;
          lobby.gameState = "Ready";
          lobby.roundCount = 1;
          lobby.timer.started = true;
          lobby.timer.remainingTime = 60;
          io.to(lobby.id).emit('changeGameState', "Ready");
        }
      }
    });
    

    socket.on("buttonClick", (buttonName, socketId) => {
      const lobby = lobbies.find(lobby => lobby.players.includes(socketId));
        console.log(buttonName);
        lobby.selectedButton = buttonName;
        lobby.timer.remainingTime = 60;
        const lobbyId = players[socket.id].lobbyId
        io.to(lobby.id).emit("buttonClick", lobby.selectedButton, socketId,)
        
    })

    

    socket.on('cardPlayed', async function (cardName, socketId) {
      const lobby = lobbies.find(lobby => lobby.players.includes(socketId));
      console.log(lobby)
        console.log("cardPlayed");
          lobby.timer.remainingTime = 60;
        io.to(lobby.id).emit('cardPlayed', cardName, socketId);
        players[socketId].playedCard = cardName;
        console.log(players[socketId].playedCard);
        const className = cardName.charAt(0).toUpperCase() + cardName.slice(1);

        try {
            // dynamically load the module based on the card name
            const CardModule = await import(`./client/src/helpers/cards/${className}.js`);
            
            // create an instance of the card class
            const card = new CardModule.default();
            
            // access the attributes of the card
           console.log("your attack:" + card[lobby.selectedButton]);
           players[socketId].cardAttack = card[lobby.selectedButton];
          } catch (error) {
            console.error(error);
          }
        
        lobby.selectorCheck++;
        console.log(lobby.selectorCheck);
        if (lobby.selectorCheck === 2) {
          setTimeout(() => {
            io.to(lobby.id).emit("changeSelector", lobby.selectedButton);
          }, 2000)
            lobby.selectorCheck = 0;
            lobby.roundCount++;
            console.log(lobby.roundCount);

           

              // compare the attack values and update the scores
        const playerIds = lobby.players;
        const player1 = players[playerIds[0]];
        const player2 = players[playerIds[1]];

        if (roundCount === 6) {
          console.log("6 Rounds have happened")
          console.log("Player1 Score:" + player1.score)
          console.log("Player2 Score:" +player2.score)
          
          if (player1.score === player2.score) {
            io.to(lobby.id).emit("reDraw");
            player1.score = 0;
            player2.score = 0;
          }

        }

       

        if (player1.cardAttack > player2.cardAttack) {
          setTimeout(() => {
            player1.score++;
            io.to(playerIds[0]).emit('updateScore', player1.score, player2.score, playerIds[0]);
            io.to(playerIds[1]).emit('updateScore', player2.score, player1.score, playerIds[0]); // exclude player 1 from receiving the event
            io.to(playerIds[0]).emit("destroyOpCard");
            io.to(playerIds[1]).emit("destroyMyCard");
          }, 4000);
          } else if (player2.cardAttack > player1.cardAttack) {
            setTimeout(() => {
            player2.score++;
            io.to(playerIds[1]).emit('updateScore', player2.score, player1.score, playerIds[1]);
            io.to(playerIds[0]).emit('updateScore', player1.score, player2.score, playerIds[1]); // exclude player 2 from receiving the event
            io.to(playerIds[1]).emit("destroyOpCard");
            io.to(playerIds[0]).emit("destroyMyCard");
          }, 4000)

         
          } else if (player2.cardAttack === player1.cardAttack) {
            io.to(playerIds[1]).emit("destroyBothCards");
            io.to(playerIds[0]).emit("destroyBothCards");
          } else {
           
          }

          
          
        }
        io.emit('changeTurn');
      
    });

    socket.on("checkWinners", () => {
      const playerIds = Object.keys(players);
        const player1 = players[playerIds[0]];
        const player2 = players[playerIds[1]];

        checkWinConditions(player1, player2, playerIds);
    })

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        // delete players[socket.id];
        // playerCount--;
        // const lobby = lobbies.find(lobby => lobby.players.includes(socket.id));
        // if (lobby) {
        //   lobby.players = lobby.players.filter(playerId => playerId !== socket.id);
        //   if (lobby.players.length === 0) {
        //     // clearInterval(lobby.timer.interval);
        //     lobbies = lobbies.filter(l => l.id !== lobby.id);
        //     console.log(`Deleted lobby ${lobby.id}`);
        //   }
        // }
    });
});

const port = process.env.PORT || 3000;


server.listen(port, function () {
    console.log('Server started!');
});