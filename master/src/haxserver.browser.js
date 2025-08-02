export async function createHaxballRoom(
  serverName,
  password,
  recaptchaToken,
  adminToken,
  numberOfPlayersPerTeam,
) {
  var tickNumber = 0;
  var announceNoOvertime = false;
  var gameEnded = false;
  var updateTeamsInProgress = false;
  var kickOffDuration = 0;

  var room = window.HBInit({
    roomName: serverName,
    password: password ? password : null,
    maxPlayers: 16,
    noPlayer: true,
    public: false,
    token: recaptchaToken,
  });
  room.players = {};

  room.setTimeLimit(3);
  room.setScoreLimit(3);
  room.setDefaultStadium("Classic");

  room.onPlayerJoin = async function (player) {
    room.players[player.id] = {
      bot: false,
      lastActivityTime: 0,
    };

    window.messageToServer("onPlayerJoin", player.name);

    room.sendAnnouncement(
      "Welcome to " + serverName + ", " + player.name + " !",
      player.id,
      "0xFFFB00",
      "bold",
    );

    wait(2000);
    if (!updateTeamsInProgress) {
      updateTeams(room);
    }

    if (!room.players[player.id].bot) {
      sendHelpMessage(room, player);
    }
  };

  room.onPlayerLeave = function (player) {
    if (room.players[player.id].bot) {
      var botName = room.players[player.id].botName;
      delete room.players[player.id];
      window.messageToServer("onPlayerLeave", {
        botName: botName,
        roomId: player.id,
      });
    } else {
      window.messageToServer("onPlayerLeave", player.name);
    }
    var scores = room.getScores();
    if (scores && player.team != 0) {
      room.pauseGame(true);
      interruptGame(room, scores);
    }
  };

  room.onGameTick = function () {
    var scores = room.getScores();
    if (!scores) {
      return;
    }

    tickNumber++;

    var data = {};
    data.ball = room.getBallPosition();
    data.players = {};
    room.getPlayerList().forEach((player) => {
      data.players[player.id] = player;
    });
    data.tick = tickNumber;
    data.scores = room.getScores();
    data.gameEnded = gameEnded;
    window.messageToServer("onGameTick", data);

    if (data.ball.x == 0 && data.ball.y == 0) {
      kickOffDuration++;
    } else if (kickOffDuration > 0) {
      kickOffDuration = 0;
    }

    if (gameEnded) {
      return;
    }

    if (data.scores.timeLimit > 0) {
      if (
        !announceNoOvertime &&
        data.scores.time > data.scores.timeLimit - 31
      ) {
        room.sendAnnouncement(
          "No overtime ! 30 seconds to go...",
          null,
          "0xFFFB00",
        );
        announceNoOvertime = true;
      } else if (data.scores.time > data.scores.timeLimit) {
        room.pauseGame(true);
        interruptGame(room, data.scores);
      }
    }
    if (data.scores.scoreLimit > 0) {
      if (
        data.scores.red == data.scores.scoreLimit ||
        data.scores.blue == data.scores.scoreLimit
      ) {
        interruptGame(room, data.scores);
      }
    }
  };

  room.onPositionsReset = function () {
    window.messageToServer("onPositionsReset", {});
  };

  room.onGameStart = function (_byPlayer) {
    tickNumber = 0;
    var dateNow = Date.now();
    window.messageToServer("onGameStart", {});
    room.getPlayerList().forEach((player) => {
      room.players[player.id].lastActivityTime = dateNow;
    });
    announceNoOvertime = false;
    gameEnded = false;
    updateTeamsInProgress = false;
    kickOffDuration = 0;
  };

  room.onPlayerChat = function (player, message) {
    if (message.startsWith("!")) {
      const args = message.split(/\s+/);
      const command = args[0].toLowerCase();

      if (command == "!help") {
        sendHelpMessage(room, player);
      } else if (command == "!admin") {
        if (args[1] != adminToken) {
          room.sendAnnouncement("Wrong token!", player.id);
        } else {
          room.setPlayerAdmin(player.id, !player.admin);
        }
      } else if (command == "!bot") {
        if (args[1] != adminToken) {
          room.sendAnnouncement("Wrong token!", player.id);
        } else if (args[2]) {
          var botName = parseInt(args[2]);
          room.sendAnnouncement(
            "You are now auth as the bot id " + botName,
            player.id,
          );
          window.messageToServer("onBotAuthentification", {
            botName: botName,
            roomId: player.id,
          });
          room.players[player.id].bot = true;
          room.players[player.id].botName = botName;
        }
      } else {
        room.sendAnnouncement("Unknown command!", player.id);
      }
      return false;
    }
    return !message.startsWith("!");
  };

  room.onPlayerActivity = function (player) {
    room.players[player.id].lastActivityTime = Date.now();
  };

  room.onPlayerTeamChange = async function (changedPlayer, byPlayer) {
    if (room.getScores()) {
      return;
    }

    if (byPlayer) {
      return;
    }

    await wait(1000);
    if (isGameReadyToPlay(room)) {
      room.startGame();
    } else {
      updateTeams(room);
    }
  };

  function sendHelpMessage(room, player) {
    room.sendAnnouncement(
      "This room allows to play 1v1 games against the computer.",
      player.id,
      "0xFFFB00",
    );
    room.sendAnnouncement(
      "AI bots are very bad at playing HaxBall for the moment but they will be better soon (hope so!).",
      player.id,
      "0xFFFB00",
    );
    room.sendAnnouncement(
      " - If you are developer, have a look at the GitHub project here : github.com/ludovjb/haxball_ai",
      player.id,
      "0xFFFB00",
    );
    room.sendAnnouncement(
      " - You will be able to make you own AI scripts soon.",
      player.id,
      "0xFFFB00",
    );
    room.sendAnnouncement(
      " - Please report issues and make suggestions on the GitHub page, thanks :)",
      player.id,
      "0xFFFB00",
    );
  }

  async function interruptGame(room, scores) {
    gameEnded = true;
    var cleanRedTeam = true;

    if (kickOffDuration > 1200) {
      room.sendAnnouncement(
        "Kick-off too long... The match is interrupted.",
        null,
        "0xFF0000",
        "bold",
      );
      kickOffDuration = 0;
    } else if (scores.red > scores.blue) {
      room.sendAnnouncement("Red team won the match", null, "0xFFFB00", "bold");
    } else if (scores.blue > scores.red) {
      room.sendAnnouncement(
        "Blue team won the match",
        null,
        "0xFFFB00",
        "bold",
      );
    } else if (scores.time > scores.scoreLimit) {
      room.sendAnnouncement("It's a draw !", null, "0xFFFB00", "bold");
    } else {
      room.sendAnnouncement(
        "A player has left... The match is interrupted.",
        null,
        "0xFF0000",
        "bold",
      );
      cleanRedTeam = false;
    }

    await wait(4000);
    await room.stopGame();
    room.sendAnnouncement("Next match is coming...", null, "0xFFFB00");
    await wait(1000);
    updateTeams(room, cleanRedTeam);
  }

  function getPlayersInTeam(room, team, list = null) {
    if (list == null) {
      list = room.getPlayerList();
    }
    return list.filter((player) => player.team == team);
  }

  function getPlayers(room, isBot) {
    return room
      .getPlayerList()
      .filter(
        (player) =>
          room.players[player.id] && room.players[player.id].bot == isBot,
      );
  }

  function isGameReadyToPlay(room) {
    var redPlayersNumber = getPlayersInTeam(room, 1).length;
    var bluePlayersNumber = getPlayersInTeam(room, 2).length;
    return !room.getScores() && redPlayersNumber == bluePlayersNumber;
  }

  async function updateTeams(room, clearRedTeam = false) {
    if (room.getScores()) {
      return;
    }

    updateTeamsInProgress = true;
    if (clearRedTeam) {
      getPlayersInTeam(room, 1).forEach((player) =>
        room.setPlayerTeam(player.id, 0),
      );
    }

    var bots = getPlayers(room, true);
    var availableBots = getPlayersInTeam(room, 0, bots).concat(
      getPlayersInTeam(room, 1, bots),
    );
    if (
      getPlayersInTeam(room, 2).length < numberOfPlayersPerTeam &&
      availableBots.length > 0
    ) {
      var bot = availableBots.shift();
      room.setPlayerTeam(bot.id, 2);
      return;
    }

    var availablePlayers = getPlayersInTeam(room, 0);
    availablePlayers = availablePlayers.filter((player) => !player.admin);
    if (
      (await getPlayersInTeam(room, 1).length) < numberOfPlayersPerTeam &&
      availablePlayers.length > 0
    ) {
      var player = availablePlayers.shift();
      room.setPlayerTeam(player.id, 1);
      return;
    }

    updateTeamsInProgress = false;
  }

  function wait(time) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), time);
    });
  }

  function noActivityCheck(room) {
    if (!room.getScores()) {
      return;
    }

    var dateNow = Date.now();
    room.getPlayerList().forEach((player) => {
      if (player.admin || player.team == 0 || room.players[player.id].bot) {
        return;
      }

      var deltaTime = dateNow - room.players[player.id].lastActivityTime;
      if (deltaTime > 15000) {
        room.kickPlayer(player.id, "You were AFK", false);
      }
    });

    var scores = room.getScores();
    if (scores && kickOffDuration > 1200) {
      interruptGame(room, scores);
      room.pauseGame(true);
    }
  }
  setInterval(noActivityCheck, 2000, room);
  return room;
}
