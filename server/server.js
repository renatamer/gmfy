//Importar dependencias
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const moment = require("moment");
const formatMessage = require("./utils/messages");
let user;
let error;

//Importar clases
const { LiveGames } = require("./utils/liveGames");
const { Players } = require("./utils/players");
const { userJoin } = require("./utils/users");

const publicPath = path.join(__dirname, "../public");
const publicPath1 = path.join(__dirname, "../media");
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var games = new LiveGames();
var players = new Players();

//Variables equipos
var val = 0;
var equipo1 = 0;
var equipo2 = 0;
var puntaje1 = 0;
var puntaje2 = 0;

//Configuracion Oracle DB
var oracledb = require("oracledb");
var dbConfig = require("../dbconfig.js");

oracledb.getConnection(
  {
    user: dbConfig.dbuser,
    password: dbConfig.dbpassword,
    connectString: dbConfig.connectString,
  },

  //Test de conexion a la db (localhost:3050)
  function (err, connection) {
    if (err) {
      error = err;
      return;
    }
    connection.execute("select user from dual", [], function (err, result) {
      if (err) {
        error = err;
        return;
      }
      user = result.rows[0][0];
      error = null;
      connection.close(function (err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
);

http
  .createServer(function (request, response) {
    response.writeHead(200, {
      "Content-Type": "text/plain",
    });
    if (error === null) {
      response.end(
        "Test de conexion exitoso. Estas conectado a la DB como " + user + "!"
      );
    } else if (error instanceof Error) {
      response.write(
        "Test de conexion fallido, revisa la configuracion y reinicia la app! "
      );
      response.end(error.message);
    } else {
      response.end(
        "Test de conexion pendiente. Refresca la ventana en unos segundos...."
      );
    }
  })
  .listen(3050);

//Establece directorios base para static
app.use(express.static(publicPath));
app.use(express.static(publicPath1));

//Iniciar servidor en puerto 3000
server.listen(3000, () => {
  console.log("Servidor iniciado en puerto 3000");
});

const botName = "Gamifiwork Bot";

//Cuando la conexion al servidor es hecha por el cliente
io.on("connection", (socket) => {
  console.log("Conectado al servidor");

  //Saluda a un usuario que se une
  socket.emit(
    "message",
    formatMessage(botName, "Bienvenido a la trivia sincrónica de Gamifiwork!")
  );

  socket.on("joinRoom", ({ name, pin }) => {
    const user = userJoin(socket.id, name, pin);
    socket.join(user.pin);

    //Transmitir cuando un jugador se conecta
    socket.broadcast
      .to(user.pin)
      .emit(
        "message",
        formatMessage(
          botName,
          `<b>${user.name}</b> se ha conectado a la partida`
        )
      );

    //Transmite cuando un jugador se desconecta
    socket.on("disconnect", () => {
      io.emit(
        "message",
        formatMessage(
          botName,
          `<b>${user.name}</b> se ha desconectado de la partida`
        )
      );
    });
  });

  //Cuando el HOST se conecta por primera vez
  socket.on("host-join", (data) => {
    //Validar si el ID enviado por la URL corresponde a un ID de una trivia en la BD
    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select id_tematica, nombre from app_tematica where id_tematica = :1",
          [data.id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            socket.emit("gameNamesData", result);

            if (result.rows.length !== 0) {
              var gamePin = Math.floor(Math.random() * 90000) + 10000; //Nuevo pin de partida
              games.addGame(gamePin, socket.id, false, {
                playersAnswered: 0,
                questionLive: false,
                gameid: data.id,
                question: 1,
              }); //Crea una partida con el pin y el ID del HOST
              var game = games.getGame(socket.id); //Obtiene los datos de la partida
              socket.join(game.pin); //El HOST se une a una sala en base al pin
              console.log("Partida creada con el pin:", game.pin);

              //Se envia el pin de la partida al HOST para compartirla a los jugadores para que se unan
              socket.emit("showGamePin", {
                pin: game.pin,
              });
            } else {
              socket.emit("noGameFound");
            }
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  //Cuando el anfitrión se conecta desde la vista del juego
  socket.on("host-join-game", (data) => {
    var oldHostId = data.id;
    var game = games.getGame(oldHostId); //Obtiene el juego con la identificación de host anterior
    if (game) {
      game.hostId = socket.id; //Cambia la identificación de host del juego por una nueva identificación de host
      socket.join(game.pin);
      var playerData = players.getPlayers(oldHostId); //Obtiene los jugadores de la partida
      for (var i = 0; i < Object.keys(players.players).length; i++) {
        if (players.players[i].hostId == oldHostId) {
          players.players[i].hostId = socket.id;
        }
      }
      var gameid = game.gameData["gameid"];
      var gameidaux = 1;

      if (gameid === gameidaux) {
        oracledb.getConnection(
          {
            user: dbConfig.dbuser,
            password: dbConfig.dbpassword,
            connectString: dbConfig.connectString,
          },
          function (err, connection) {
            if (err) {
              console.error(err.message);
              return;
            }
            connection.execute(
              `select app_tematica.id_tematica, app_tematica.nombre, app_pregunta.id_pregunta, app_pregunta.pregunta, app_pregunta.puntos, app_pregunta.tiempo, app_pregunta.audio, app_alternativa.alternativa, app_alternativa.es_correcta
              from app_tematica join app_pregunta
              on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
              join app_alternativa
              on app_pregunta.id_pregunta = app_alternativa.pregunta_id_pregunta
              where app_tematica.id_tematica = :1
              and app_pregunta.id_pregunta = :1`,
              [gameid],
              { outFormat: oracledb.OUT_FORMAT_OBJECT },
              function (err, result) {
                if (err) {
                  console.error(err.message);
                  return;
                }
                //console.log(result.rows);
                //console.log("ALT CORRECTA: ", result.rows[0].ES_CORRECTA);
                console.log("Game ID", gameid, "ha iniciado");

                var question = result.rows[0].PREGUNTA;
                var answer1 = result.rows[0].ALTERNATIVA;
                var answer2 = result.rows[1].ALTERNATIVA;

                if (
                  (answer1 === "Verdadero") |
                  ((answer1 === "Falso") & (answer2 === "Verdadero")) |
                  (answer2 === "Falso")
                ) {
                  var answer3 = "";
                  var answer4 = "";
                } else {
                  var answer3 = result.rows[2].ALTERNATIVA;
                  var answer4 = result.rows[3].ALTERNATIVA;
                }

                var tiempo = result.rows[0].TIEMPO;
                var audio = result.rows[0].AUDIO;

                if (result.rows[0].ES_CORRECTA === 1) {
                  var correctAnswer = 1;
                } else if (result.rows[1].ES_CORRECTA === 1) {
                  var correctAnswer = 2;
                } else if (result.rows[2].ES_CORRECTA === 1) {
                  var correctAnswer = 3;
                } else {
                  var correctAnswer = 4;
                }

                //console.log("ENTREGA ALT CORRECTA: ", correctAnswer);

                socket.emit("gameQuestions", {
                  q1: question,
                  a1: answer1,
                  a2: answer2,
                  a3: answer3,
                  a4: answer4,
                  correct: correctAnswer,
                  playersInGame: playerData.length,
                  tiempo: tiempo,
                  audio: audio,
                });

                connection.close(function (err) {
                  if (err) {
                    console.error(err.message);
                  }
                });
              }
            );
          }
        );
      } else {
        oracledb.getConnection(
          {
            user: dbConfig.dbuser,
            password: dbConfig.dbpassword,
            connectString: dbConfig.connectString,
          },
          function (err, connection) {
            if (err) {
              console.error(err.message);
              return;
            }
            connection.execute(
              `select app_tematica.id_tematica, app_tematica.nombre, app_pregunta.id_pregunta, app_pregunta.pregunta, app_pregunta.puntos, app_pregunta.tiempo, app_pregunta.audio, app_alternativa.alternativa, app_alternativa.es_correcta
                        from app_tematica join app_pregunta
                        on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
                        join app_alternativa
                        on app_pregunta.id_pregunta = app_alternativa.pregunta_id_pregunta
                        where app_tematica.id_tematica = :1
                        and app_pregunta.preg_orden = 1
                        order by app_alternativa.alt_orden`,
              [gameid],
              { outFormat: oracledb.OUT_FORMAT_OBJECT },
              function (err, result) {
                if (err) {
                  console.error(err.message);
                  return;
                }
                //console.log(result.rows);
                console.log("Game ID", gameid, "ha iniciado");

                var question = result.rows[0].PREGUNTA;
                var answer1 = result.rows[0].ALTERNATIVA;
                var answer2 = result.rows[1].ALTERNATIVA;

                if (
                  (answer1 === "Verdadero") |
                  ((answer1 === "Falso") & (answer2 === "Verdadero")) |
                  (answer2 === "Falso")
                ) {
                  var answer3 = "";
                  var answer4 = "";
                } else {
                  var answer3 = result.rows[2].ALTERNATIVA;
                  var answer4 = result.rows[3].ALTERNATIVA;
                }

                var tiempo = result.rows[0].TIEMPO;
                var audio = result.rows[0].AUDIO;

                if (result.rows[0].ES_CORRECTA === 1) {
                  var correctAnswer = 1;
                } else if (result.rows[1].ES_CORRECTA === 1) {
                  var correctAnswer = 2;
                } else if (result.rows[2].ES_CORRECTA === 1) {
                  var correctAnswer = 3;
                } else {
                  var correctAnswer = 4;
                }

                //console.log("ENTREGA ALT CORRECTA: ", correctAnswer);

                socket.emit("gameQuestions", {
                  q1: question,
                  a1: answer1,
                  a2: answer2,
                  a3: answer3,
                  a4: answer4,
                  correct: correctAnswer,
                  playersInGame: playerData.length,
                  tiempo: tiempo,
                  audio: audio,
                });

                connection.close(function (err) {
                  if (err) {
                    console.error(err.message);
                  }
                });
              }
            );
          }
        );
      }
      io.to(game.pin).emit("gameStartedPlayer");
      game.gameData.questionLive = true;
    } else {
      socket.emit("noGameFound"); //No se encontró ningún juego, redirige al usuario
    }
  });

  //Cuando el jugador se conecta por primera vez
  socket.on("player-join", (params, equipos) => {
    var gameFound = false; //Si se encuentra un juego con el pin proporcionado por el jugador

    //Para cada juego de la clase Games
    for (var i = 0; i < games.games.length; i++) {
      //Si el pin es igual a uno de los pin del juego
      if (params.pin == games.games[i].pin) {
        console.log("Jugador", params.name, "se ha conectado a la partida");

        var hostId = games.games[i].hostId; //Obtiene el id del anfitrion de la partida
        var jugadores = players.getPlayers(hostId).length;

        if (jugadores === 0) {
          equipo1 = 0;
          equipo2 = 0;
        } //Resetea equipos

        if (jugadores === 0 && val === 1) {
          val = 0;
        } //Resetea distribucion

        if (equipos === "No") {
          players.addPlayer(hostId, socket.id, params.name, {
            score: 0,
            answer: 0,
            equipo: "Individual",
          }); //Agrega un jugador a la partida
        } else if (val === 0) {
          players.addPlayer(hostId, socket.id, params.name, {
            score: 0,
            answer: 0,
            equipo: "Equipo 1",
          }); //Agrega un jugador a la partida (con equipo 1)
          val = 1;
          equipo1 = equipo1 + 1;
        } else if (val === 1) {
          players.addPlayer(hostId, socket.id, params.name, {
            score: 0,
            answer: 0,
            equipo: "Equipo 2",
          }); //Agrega un jugador a la partida (con equipo 2)
          val = 0;
          equipo2 = equipo2 + 1;
        }

        socket.join(params.pin); //El jugador se une a la sala según el pin

        var playersInGame = players.getPlayers(hostId); //Obteniendo a todos los jugadores en juego

        io.to(params.pin).emit(
          "updatePlayerLobby",
          playersInGame,
          equipo1,
          equipo2
        ); //Envío de datos del jugador anfitrión para mostrar en pantalla lobby

        gameFound = true; //Se ha encontrado el juego
      }
    }

    //Si no se ha encontrado el juego
    if (gameFound == false) {
      socket.emit("noGameFound"); //El jugador es enviado de vuelta a la página 'principal' porque no se encontró el juego con el pin
    }
  });

  //Cuando el jugador se conecta desde la vista del juego
  socket.on("player-join-game", (data) => {
    var player = players.getPlayer(data.id);
    if (player) {
      var game = games.getGame(player.hostId);
      socket.join(game.pin);
      player.playerId = socket.id; //Actualizar la id del jugador con socket id

      var playerData = players.getPlayers(game.hostId);
      socket.emit("playerGameData", playerData);
    } else {
      socket.emit("noGameFound"); //Ningún jugador encontrado
    }
  });

  //Cuando un anfitrión o jugador abandona el juego
  socket.on("disconnect", () => {
    var game = games.getGame(socket.id); //Buscando el juego con socket.id
    //Si se encuentra un juego alojado por esa id, el socket desconectado es un host
    if (game) {
      //Comprobando si el host se desconectó o se envió a la vista del juego
      if (game.gameLive == false) {
        games.removeGame(socket.id); //Eliminar el juego de la clase Games
        console.log("Juego finalizado con pin:", game.pin);

        var playersToRemove = players.getPlayers(game.hostId); //Obtener todos los jugadores de la partida

        //Para cada jugador en el juego
        for (var i = 0; i < playersToRemove.length; i++) {
          players.removePlayer(playersToRemove[i].playerId); //Eliminar a cada jugador de la clase Players
        }

        io.to(game.pin).emit("hostDisconnect"); //Enviar al jugador de vuelta a la pantalla 'principal'
        socket.leave(game.pin); //Socket deja la sala
        console.log("El host se ha desconectado a la partida");
      }
    } else {
      //No se ha encontrado ningún juego, por lo que es un jugador que se ha desconectado
      var player = players.getPlayer(socket.id); //Obteniendo el jugador con socket.id
      //Si se encuentra un jugador con ese id
      if (player) {
        var hostId = player.hostId; //Obtiene la id del anfitrión del juego
        var game = games.getGame(hostId); //Obtiene datos del juego con hostId
        var pin = game.pin; //Obtiene el pin del juego
        var obtEquipo = players.getPlayer(socket.id).gameData.equipo; //Obtiene equipo al que pertenece

        if (obtEquipo === "Equipo 1") {
          equipo1 = equipo1 - 1;
        } else if (obtEquipo === "Equipo 2") {
          equipo2 = equipo2 - 1;
        }

        console.log(
          "Jugador",
          players.getPlayer(socket.id).name,
          "se ha desconectado a la partida"
        );

        if (game.gameLive == false) {
          players.removePlayer(socket.id); //Elimina al jugador de la clase Players
          var playersInGame = players.getPlayers(hostId); //Obtiene los jugadores restantes en el juego

          io.to(pin).emit("updatePlayerLobby", playersInGame, equipo1, equipo2); //Envía datos al host para actualizar la pantalla
          socket.leave(pin); //El jugador esta saliendo de la habitacion
        }
      }
    }
  });

  //Establece datos en la clase de players para responder desde el jugador
  socket.on("playerAnswer", function (num) {
    var player = players.getPlayer(socket.id);
    var hostId = player.hostId;
    var playerNum = players.getPlayers(hostId);
    var game = games.getGame(hostId);
    if (game.gameData.questionLive == true) {
      //Si la pregunta esta aun activa
      player.gameData.answer = num;
      game.gameData.playersAnswered += 1;

      var gameQuestion = game.gameData.question;
      var gameid = game.gameData.gameid;

      oracledb.getConnection(
        {
          user: dbConfig.dbuser,
          password: dbConfig.dbpassword,
          connectString: dbConfig.connectString,
        },
        function (err, connection) {
          if (err) {
            console.error(err.message);
            return;
          }
          connection.execute(
            `select distinct app_tematica.id_tematica, app_pregunta.preg_orden, app_pregunta.puntos, app_alternativa.alt_orden, app_alternativa.es_correcta
                       from app_tematica join app_pregunta
                       on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
                       join app_alternativa
                       on app_pregunta.id_pregunta = app_alternativa.pregunta_id_pregunta
                       where app_tematica.id_tematica = :1
                       and app_pregunta.preg_orden = :2
                       and app_alternativa.es_correcta = 1`,
            [gameid, gameQuestion],
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
            function (err, result) {
              if (err) {
                console.error(err.message);
                return;
              }

              var correctAnswer = result.rows[0].ALT_ORDEN;
              var puntos = result.rows[0].PUNTOS;
              //console.log("ALT. CORRECTA: ", correctAnswer);
              //console.log("PUNTAJE CORRECTA: ", puntos);

              //Revisa la respuesta del jugador con la respuesta correcta
              if (num == correctAnswer) {
                player.gameData.score += puntos;
                io.to(game.pin).emit("getTime", socket.id);
                socket.emit("answerResult", true);
              }
              //Revisa si todos los jugadores contestaron
              if (game.gameData.playersAnswered == playerNum.length) {
                game.gameData.questionLive = false; //La pregunta termina porque todos los jugadores contestaron antes del tiempo
                var playerData = players.getPlayers(game.hostId);
                io.to(game.pin).emit("questionOver", playerData, correctAnswer); //Avisa a todos que la pregunta termino
              } else {
                //Actualizar la pantalla de host de número de jugadores que han respondido
                io.to(game.pin).emit("updatePlayersAnswered", {
                  playersInGame: playerNum.length,
                  playersAnswered: game.gameData.playersAnswered,
                });
                connection.close(function (err) {
                  if (err) {
                    console.error(err.message);
                  }
                });
              }
            }
          );
        }
      );
    }
  });

  socket.on("getScore", function () {
    var player = players.getPlayer(socket.id);

    //RANKING PARCIAL POR RONDA
    var hostId = player.hostId;
    var playersInGame = players.getPlayers(hostId);
    var first = { name: "", score: 0 };
    var second = { name: "", score: 0 };
    var third = { name: "", score: 0 };
    var fourth = { name: "", score: 0 };
    var fifth = { name: "", score: 0 };
    var primer = { equipo: "", pje: 0 };
    var segundo = { equipo: "", pje: 0 };

      for (var i = 0; i < playersInGame.length; i++) {
        // console.log(playersInGame[i].name, playersInGame[i].gameData.score);
        if (playersInGame[i].gameData.score >= fifth.score) {
          if (playersInGame[i].gameData.score >= fourth.score) {
            if (playersInGame[i].gameData.score >= third.score) {
              if (playersInGame[i].gameData.score >= second.score) {
                if (playersInGame[i].gameData.score >= first.score) {
                  //Primer lugar
                  fifth.name = fourth.name;
                  fifth.score = fourth.score;

                  fourth.name = third.name;
                  fourth.score = third.score;

                  third.name = second.name;
                  third.score = second.score;

                  second.name = first.name;
                  second.score = first.score;

                  first.name = playersInGame[i].name;
                  first.score = playersInGame[i].gameData.score;
                } else {
                  //Segundo lugar
                  fifth.name = fourth.name;
                  fifth.score = fourth.score;

                  fourth.name = third.name;
                  fourth.score = third.score;

                  third.name = second.name;
                  third.score = second.score;

                  second.name = playersInGame[i].name;
                  second.score = playersInGame[i].gameData.score;
                }
              } else {
                //Tercer lugar
                fifth.name = fourth.name;
                fifth.score = fourth.score;

                fourth.name = third.name;
                fourth.score = third.score;

                third.name = playersInGame[i].name;
                third.score = playersInGame[i].gameData.score;
              }
            } else {
              //Cuarto lugar
              fifth.name = fourth.name;
              fifth.score = fourth.score;

              fourth.name = playersInGame[i].name;
              fourth.score = playersInGame[i].gameData.score;
            }
          } else {
            //Quinto lugar
            fifth.name = playersInGame[i].name;
            fifth.score = playersInGame[i].gameData.score;
          }
        }
      }  

        //calcularRankingTeam(player);

    io.to(socket.id).emit("Rank", {
      num1: first.name,
      num2: second.name,
      num3: third.name,
      num4: fourth.name,
      num5: fifth.name,
      sc1: first.score,
      sc2: second.score,
      sc3: third.score,
      sc4: fourth.score,
      sc5: fifth.score,
    });
    socket.emit("newScore", player.gameData.score);
  });

  socket.on("getScoreTeam", function () {
    var player = players.getPlayers(socket.id);

    //RANKING PARCIAL POR RONDA
    var game = games.getGame(socket.id);
    var playersInGame = players.getPlayers(game.hostId);
    var first = { name: "", score: 0 };
    var second = { name: "", score: 0 };
    var third = { name: "", score: 0 };
    var fourth = { name: "", score: 0 };
    var fifth = { name: "", score: 0 };
    var primer = { equipo: "", pje: 0 };
    var segundo = { equipo: "", pje: 0 };

      for (var i = 0; i < playersInGame.length; i++) {
        // console.log(playersInGame[i].name, playersInGame[i].gameData.score);
        if (playersInGame[i].gameData.score >= fifth.score) {
          if (playersInGame[i].gameData.score >= fourth.score) {
            if (playersInGame[i].gameData.score >= third.score) {
              if (playersInGame[i].gameData.score >= second.score) {
                if (playersInGame[i].gameData.score >= first.score) {
                  //Primer lugar
                  fifth.name = fourth.name;
                  fifth.score = fourth.score;

                  fourth.name = third.name;
                  fourth.score = third.score;

                  third.name = second.name;
                  third.score = second.score;

                  second.name = first.name;
                  second.score = first.score;

                  first.name = playersInGame[i].name;
                  first.score = playersInGame[i].gameData.score;
                } else {
                  //Segundo lugar
                  fifth.name = fourth.name;
                  fifth.score = fourth.score;

                  fourth.name = third.name;
                  fourth.score = third.score;

                  third.name = second.name;
                  third.score = second.score;

                  second.name = playersInGame[i].name;
                  second.score = playersInGame[i].gameData.score;
                }
              } else {
                //Tercer lugar
                fifth.name = fourth.name;
                fifth.score = fourth.score;

                fourth.name = third.name;
                fourth.score = third.score;

                third.name = playersInGame[i].name;
                third.score = playersInGame[i].gameData.score;
              }
            } else {
              //Cuarto lugar
              fifth.name = fourth.name;
              fifth.score = fourth.score;

              fourth.name = playersInGame[i].name;
              fourth.score = playersInGame[i].gameData.score;
            }
          } else {
            //Quinto lugar
            fifth.name = playersInGame[i].name;
            fifth.score = playersInGame[i].gameData.score;
          }
        }
      } 

      calcularRankingTeam(player);

    socket.emit("RankInd", {
      num1: first.name,
      num2: second.name,
      num3: third.name,
      num4: fourth.name,
      num5: fifth.name,
      sc1: first.score,
      sc2: second.score,
      sc3: third.score,
      sc4: fourth.score,
      sc5: fifth.score,
    });

    if(playersInGame[0].gameData.equipo !== 'Individual'){

      if (puntaje1 >= puntaje2) {
        primer.equipo = "Equipo 1";
        primer.pje = puntaje1;
        segundo.equipo = "Equipo 2";
        segundo.pje = puntaje2;
      } else if (puntaje2 >= puntaje1) {
        primer.equipo = "Equipo 2";
        primer.pje = puntaje2;
        segundo.equipo= "Equipo 1";
        segundo.pje = puntaje1;
      }
      
      socket.emit("RankTeam", {
        eq1: primer.equipo,
        eq2: segundo.equipo, 
        pj1: primer.pje,
        pj2: segundo.pje,       
      });
    }
  });
  

  socket.on("time", function (data) {
    var time = data.time / 20;
    time = time * 100;
    var playerid = data.player;
    var player = players.getPlayer(playerid);
    player.gameData.score += time;
  });

  socket.on("timeUp", function () {
    var game = games.getGame(socket.id);
    game.gameData.questionLive = false;
    var playerData = players.getPlayers(game.hostId);

    var gameQuestion = game.gameData.question;
    var gameid = game.gameData.gameid;

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          `select distinct app_tematica.id_tematica, app_pregunta.preg_orden, app_alternativa.alt_orden, app_alternativa.es_correcta
                    from app_tematica join app_pregunta
                    on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
                    join app_alternativa
                    on app_pregunta.id_pregunta = app_alternativa.pregunta_id_pregunta
                    where app_tematica.id_tematica = :1
                    and app_pregunta.preg_orden = :2
                    and app_alternativa.es_correcta = 1`,
          [gameid, gameQuestion],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }

            var correctAnswer = result.rows[0].ALT_ORDEN;
            //console.log("ALT. CORRECTA: ", correctAnswer);

            io.to(game.pin).emit("questionOver", playerData, correctAnswer);

            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  socket.on("nextQuestion", function () {
    var playerData = players.getPlayers(socket.id);
    //Restablecer la respuesta actual de los jugadores a 0
    for (var i = 0; i < Object.keys(players.players).length; i++) {
      if (players.players[i].hostId == socket.id) {
        players.players[i].gameData.answer = 0;
      }
    }

    var game = games.getGame(socket.id);
    game.gameData.playersAnswered = 0;
    game.gameData.questionLive = true;
    game.gameData.question += 1;
    var gameid = game.gameData.gameid;

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          `select distinct app_tematica.id_tematica, app_pregunta.id_pregunta, app_pregunta.preg_orden
                    from app_tematica join app_pregunta
                    on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
                    where app_tematica.id_tematica = :1
                    order by app_pregunta.preg_orden`,
          [gameid],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }

            if (result.rows.length >= game.gameData.question) {
              var questionNum = game.gameData.question;

              oracledb.getConnection(
                {
                  user: dbConfig.dbuser,
                  password: dbConfig.dbpassword,
                  connectString: dbConfig.connectString,
                },
                function (err, connection) {
                  if (err) {
                    console.error(err.message);
                    return;
                  }
                  connection.execute(
                    `select app_pregunta.pregunta, app_pregunta.puntos, app_pregunta.tiempo, app_pregunta.audio, app_alternativa.alternativa, app_alternativa.es_correcta
                                        from app_tematica join app_pregunta
                                        on app_tematica.id_tematica = app_pregunta.tematica_id_tematica
                                        join app_alternativa
                                        on app_pregunta.id_pregunta = app_alternativa.pregunta_id_pregunta
                                        where app_tematica.id_tematica = :1
                                        and app_pregunta.preg_orden = :2
                                        order by app_alternativa.alt_orden`,
                    [gameid, questionNum],
                    { outFormat: oracledb.OUT_FORMAT_OBJECT },
                    function (err, result) {
                      if (err) {
                        console.error(err.message);
                        return;
                      }

                      var question = result.rows[0].PREGUNTA;
                      var answer1 = result.rows[0].ALTERNATIVA;
                      var answer2 = result.rows[1].ALTERNATIVA;

                      if (
                        (answer1 === "Verdadero") |
                        ((answer1 === "Falso") & (answer2 === "Verdadero")) |
                        (answer2 === "Falso")
                      ) {
                        var answer3 = "";
                        var answer4 = "";
                      } else {
                        var answer3 = result.rows[2].ALTERNATIVA;
                        var answer4 = result.rows[3].ALTERNATIVA;
                      }

                      var tiempo = result.rows[0].TIEMPO;
                      var audio = result.rows[0].AUDIO;

                      if (result.rows[0].ES_CORRECTA === 1) {
                        var correctAnswer = 1;
                      } else if (result.rows[1].ES_CORRECTA === 1) {
                        var correctAnswer = 2;
                      } else if (result.rows[2].ES_CORRECTA === 1) {
                        var correctAnswer = 3;
                      } else {
                        var correctAnswer = 4;
                      }

                      //console.log("ENTREGA ALT CORRECTA: ", correctAnswer);

                      socket.emit("gameQuestions", {
                        q1: question,
                        a1: answer1,
                        a2: answer2,
                        a3: answer3,
                        a4: answer4,
                        correct: correctAnswer,
                        playersInGame: playerData.length,
                        tiempo: tiempo,
                        audio: audio,
                      });
                      //RANKING PARCIAL POR RONDA
                      var playersInGame = players.getPlayers(game.hostId);
                      var first = { name: "", score: 0 };
                      var second = { name: "", score: 0 };
                      var third = { name: "", score: 0 };
                      var fourth = { name: "", score: 0 };
                      var fifth = { name: "", score: 0 };

                      for (var i = 0; i < playersInGame.length; i++) {
                        console.log(
                          playersInGame[i].name,
                          playersInGame[i].gameData.score
                        );
                        if (playersInGame[i].gameData.score >= fifth.score) {
                          if (playersInGame[i].gameData.score >= fourth.score) {
                            if (
                              playersInGame[i].gameData.score >= third.score
                            ) {
                              if (
                                playersInGame[i].gameData.score >= second.score
                              ) {
                                if (
                                  playersInGame[i].gameData.score >= first.score
                                ) {
                                  //Primer lugar
                                  fifth.name = fourth.name;
                                  fifth.score = fourth.score;

                                  fourth.name = third.name;
                                  fourth.score = third.score;

                                  third.name = second.name;
                                  third.score = second.score;

                                  second.name = first.name;
                                  second.score = first.score;

                                  first.name = playersInGame[i].name;
                                  first.score = playersInGame[i].gameData.score;
                                } else {
                                  //Segundo lugar
                                  fifth.name = fourth.name;
                                  fifth.score = fourth.score;

                                  fourth.name = third.name;
                                  fourth.score = third.score;

                                  third.name = second.name;
                                  third.score = second.score;

                                  second.name = playersInGame[i].name;
                                  second.score =
                                    playersInGame[i].gameData.score;
                                }
                              } else {
                                //Tercer lugar
                                fifth.name = fourth.name;
                                fifth.score = fourth.score;

                                fourth.name = third.name;
                                fourth.score = third.score;

                                third.name = playersInGame[i].name;
                                third.score = playersInGame[i].gameData.score;
                              }
                            } else {
                              //Cuarto lugar
                              fifth.name = fourth.name;
                              fifth.score = fourth.score;

                              fourth.name = playersInGame[i].name;
                              fourth.score = playersInGame[i].gameData.score;
                            }
                          } else {
                            //Quinto lugar
                            fifth.name = playersInGame[i].name;
                            fifth.score = playersInGame[i].gameData.score;
                          }
                        }
                      }                     

                      io.to(game.pin).emit("Rank", {
                        num1: first.name,
                        num2: second.name,
                        num3: third.name,
                        num4: fourth.name,
                        num5: fifth.name,
                        sc1: first.score,
                        sc2: second.score,
                        sc3: third.score,
                        sc4: fourth.score,
                        sc5: fifth.score,
                      });

                      connection.close(function (err) {
                        if (err) {
                          console.error(err.message);
                        }
                      });
                    }
                  );
                }
              );
            } else {
              //RANKING FINAL
              var playersInGame = players.getPlayers(game.hostId);
              var first = { name: "", score: 0 };
              var second = { name: "", score: 0 };
              var third = { name: "", score: 0 };
              var fourth = { name: "", score: 0 };
              var fifth = { name: "", score: 0 };
              var primer = { equipo: "", pje: 0 };
              var segundo = { equipo: "", pje: 0 };

              for (var i = 0; i < playersInGame.length; i++) {
                console.log(
                  playersInGame[i].name,
                  playersInGame[i].gameData.score
                );
                if (playersInGame[i].gameData.score >= fifth.score) {
                  if (playersInGame[i].gameData.score >= fourth.score) {
                    if (playersInGame[i].gameData.score >= third.score) {
                      if (playersInGame[i].gameData.score >= second.score) {
                        if (playersInGame[i].gameData.score >= first.score) {
                          //Primer lugar
                          fifth.name = fourth.name;
                          fifth.score = fourth.score;

                          fourth.name = third.name;
                          fourth.score = third.score;

                          third.name = second.name;
                          third.score = second.score;

                          second.name = first.name;
                          second.score = first.score;

                          first.name = playersInGame[i].name;
                          first.score = playersInGame[i].gameData.score;
                        } else {
                          //Segundo lugar
                          fifth.name = fourth.name;
                          fifth.score = fourth.score;

                          fourth.name = third.name;
                          fourth.score = third.score;

                          third.name = second.name;
                          third.score = second.score;

                          second.name = playersInGame[i].name;
                          second.score = playersInGame[i].gameData.score;
                        }
                      } else {
                        //Tercer lugar
                        fifth.name = fourth.name;
                        fifth.score = fourth.score;

                        fourth.name = third.name;
                        fourth.score = third.score;

                        third.name = playersInGame[i].name;
                        third.score = playersInGame[i].gameData.score;
                      }
                    } else {
                      //Cuarto lugar
                      fifth.name = fourth.name;
                      fifth.score = fourth.score;

                      fourth.name = playersInGame[i].name;
                      fourth.score = playersInGame[i].gameData.score;
                    }
                  } else {
                    //Quinto lugar
                    fifth.name = playersInGame[i].name;
                    fifth.score = playersInGame[i].gameData.score;
                  }
                }
              }

              guardarResultado();

              if(playersInGame[0].gameData.equipo !== 'Individual'){

                if (puntaje1 >= puntaje2) {
                  primer.equipo = "Equipo 1";
                  primer.pje = puntaje1;
                  segundo.equipo = "Equipo 2";
                  segundo.pje = puntaje2;
                } else if (puntaje2 >= puntaje1) {
                  primer.equipo = "Equipo 2";
                  primer.pje = puntaje2;
                  segundo.equipo= "Equipo 1";
                  segundo.pje = puntaje1;
                }            
              }

              console.log('UNO', primer.equipo,primer.pje)
              console.log('DOS', segundo.equipo,segundo.pje)

              io.to(game.pin).emit("GameOver", {
                numf1: first.name,
                numf2: second.name,
                numf3: third.name,
                numf4: fourth.name,
                numf5: fifth.name,
                scf1: first.score,
                scf2: second.score,
                scf3: third.score,
                scf4: fourth.score,
                scf5: fifth.score,
                eqf1: primer.equipo,
                eqf2: segundo.equipo, 
                pjf1: primer.pje,
                pjf2: segundo.pje, 
              });

              
            }
          }
        );
      }
    );
    io.to(game.pin).emit("nextQuestionPlayer");
  });

  //Cuando el anfitrión comienza el juego
  socket.on("startGame", () => {
    var game = games.getGame(socket.id); //Obtiene el juego basado en socket.id
    game.gameLive = true;
    socket.emit("gameStarted", game.hostId); //Indica a los jugadores y al anfitrion que el juego ha comenzado
  });

  //Entrega al anfitrion los nombres de las trivias disponibles
  socket.on("requestDbNames", function () {
    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select * from app_tematica order by nombre",
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            //console.log(result.rows);
            socket.emit("gameNamesData", result);
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  //Cargar avatar participante
  socket.on("cargarAvatar", function () {
    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select * from avatar order by id",
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            //console.log(result.rows);
            socket.emit("enviarListaAvatar", result);
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  //Asigna id a trivia ruleta seleccionada al azar para hostear juego
  socket.on("triviaSeleccionada", function (data) {
    var nombreTrivia = data.nombre;

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select id_tematica from app_tematica where nombre = :1",
          [nombreTrivia],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            socket.emit("startRuleta", result);
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  //Buscar ID trivias elegidas en ruleta (4)
  socket.on("buscarID4", function (data) {
    //console.log('buscarID:', data)

    var nomTrivia1 = data.nombret1;
    var nomTrivia2 = data.nombret2;
    var nomTrivia3 = data.nombret3;
    var nomTrivia4 = data.nombret4;

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select id_tematica, nombre from app_tematica where nombre in (:1, :2, :3, :4)",
          [nomTrivia1, nomTrivia2, nomTrivia3, nomTrivia4],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            //console.log('enviarID', result.rows)
            socket.emit("enviarID4", result);
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  //Buscar ID trivias elegidas en ruleta (4)
  socket.on("buscarID6", function (data) {
    //console.log('buscarID:', data)

    var nomTrivia1 = data.nombret1;
    var nomTrivia2 = data.nombret2;
    var nomTrivia3 = data.nombret3;
    var nomTrivia4 = data.nombret4;
    var nomTrivia5 = data.nombret5;
    var nomTrivia6 = data.nombret6;

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select id_tematica, nombre from app_tematica where nombre in (:1, :2, :3, :4, :5, :6)",
          [
            nomTrivia1,
            nomTrivia2,
            nomTrivia3,
            nomTrivia4,
            nomTrivia5,
            nomTrivia6,
          ],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            //console.log('enviarID', result.rows)
            socket.emit("enviarID6", result);
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  });

  function guardarResultado() {
    var game = games.getGame(socket.id);
    var playersInGame = players.getPlayers(game.hostId);
    var gameid = game.gameData.gameid;
    var numparticipantes = playersInGame.length;
    var nomtrivia;
    var idres;
    var fecha = moment().locale("es").format("LLLL");

    //console.log('FUNCIONA:', fecha)

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          "select nombre from app_tematica where id_tematica = :1",
          [gameid],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
          function (err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            nomtrivia = result.rows[0].NOMBRE;
            //console.log(nomtrivia);

            connection.execute(
              `INSERT INTO RESULTADO (numero_participantes, trivia, fecha) VALUES (:nm, :tr, :fc)`,
              [numparticipantes, nomtrivia, fecha],
              { autoCommit: true },
              function (err) {
                if (err) {
                  console.error(err.message);
                  return;
                }
              }
            );

            connection.execute(
              "select id_resultado from resultado where fecha = :1",
              [fecha],
              { outFormat: oracledb.OUT_FORMAT_OBJECT },
              function (err, result) {
                if (err) {
                  console.error(err.message);
                  return;
                }
                console.log(result.rows[0].ID_RESULTADO);
                idres = result.rows[0].ID_RESULTADO;

                for (var i = 0; i < playersInGame.length; i++) {
                  guardarRanking(idres, i);
                }
              }
            );
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  }

  function guardarRanking(idres, i) {
    var game = games.getGame(socket.id);
    var playersInGame = players.getPlayers(game.hostId);

    oracledb.getConnection(
      {
        user: dbConfig.dbuser,
        password: dbConfig.dbpassword,
        connectString: dbConfig.connectString,
      },
      function (err, connection) {
        if (err) {
          console.error(err.message);
          return;
        }
        connection.execute(
          `INSERT INTO RANKING (participante, puntos, resultado_id) VALUES (:pa, :pu, :id)`,
          [playersInGame[i].name, playersInGame[i].gameData.score, idres],
          { autoCommit: true },
          function (err) {
            if (err) {
              console.error(err.message);
              return;
            }
            connection.close(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
          }
        );
      }
    );
  }

  function calcularRankingTeam(player){

    var x = 0;
    var y = 0;

    for (var i = 0; i < player.length; i++){

      if(x === 0 || y === 0){
        if (player[i].gameData.equipo === "Equipo 1") {
          puntaje1 = player[i].gameData.score;
          x = 1;
        } else if (player[i].gameData.equipo === "Equipo 2") {
          puntaje2 = player[i].gameData.score;  
          y = 1;
        } 
      } else {
        if (player[i].gameData.equipo === "Equipo 1") {
          puntaje1 = puntaje1 + player[i].gameData.score;
        } else if (player[i].gameData.equipo === "Equipo 2") {
          puntaje2 = puntaje2 + player[i].gameData.score;
        } 
      }
    }
  }

});
