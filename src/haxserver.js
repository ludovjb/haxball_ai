
async function createHaxballRoom(serverName, password, recaptchaToken, adminToken) {
  const teamNames = ["Spectators", "Red team", "Blue team"];
  var tickNumber = 0;
  var players = {};
  var gameInProgress = false;
  var announceNoOvertime = false;
  var room = window.HBInit({
    roomName: serverName,
    password: password ? password : null,
    maxPlayers: 16,
    noPlayer: true,
    public: false,
    token: recaptchaToken
  });

  room.setTimeLimit(3);
  room.setScoreLimit(3);
  room.setDefaultStadium("Classic");

  room.onPlayerJoin = function(player) {
    window.messageToServer("onPlayerJoin", player.name);
    room.setPlayerAdmin(player.id, true);
    players[player.id] = {
      bot: false,
      lastActivityTime: 0
    }
  }

  room.onPlayerLeave = function(player) {
    if(player.id in players) {
      if(players[player.id].bot) {
        var botId = players[player.id];
        delete players[player.id];
        window.messageToServer("onPlayerLeave", { botId: botId, roomId: player.id });
      }
      else {
        window.messageToServer("onPlayerLeave", player.name );
      }
    }
  }


  room.onGameTick = function() {
    tickNumber++;
    var data = {};
    data.ball = room.getBallPosition();
    data.players = {};
    room.getPlayerList().forEach((player) => {
      data.players[player.id] = player;
    });

    data.tick = tickNumber;
    data.scores = room.getScores();

    window.messageToServer("onGameTick", data);

    if(data.scores.timeLimit > 0) {
      if(!announceNoOvertime && data.scores.time > data.scores.timeLimit - 31) {
        room.sendAnnouncement("No overtime ! 30 seconds to go...", null, "0xFF0000", "bold");
        announceNoOvertime = true;
      }
      else if(data.scores.time > data.scores.timeLimit) {
        room.sendAnnouncement("It's a draw !");
        room.stopGame();
      }
    }
  }

  room.onPositionsReset = function() {
    window.messageToServer("onPositionsReset", {});
  }

  room.onGameStart = function(byPlayer) {
    tickNumber = 0;
    var dateNow = Date.now();
    window.messageToServer("onGameStart", {});
    room.getPlayerList().forEach(player => {
      if(!(player.id in players)) {
        return;
      }

      players[player.id].lastActivityTime = dateNow;
    });
    gameInProgress = true;
    announceNoOvertime = false;
  }

  room.onGameStop = function(byPlayer) {
    gameInProgress = false;
  }

  room.onPlayerChat = function(player, message) {
    if(message.startsWith("!")) {
      const args = message.split(/\s+/);

      if(args[0] == '!admin') {
        if(args[1] != adminToken) {
          room.sendAnnouncement("Wrong token!", player.id);
        }
        else {
          room.setPlayerAdmin(player.id, !player.admin);
        }
      }

      else if(args[0] == '!bot') {
        if(args[1] != adminToken) {
          room.sendAnnouncement("Wrong token!", player.id);
        }
        else if(args[2]) {
          var botId = parseInt(args[2]);
          room.sendAnnouncement("You are now auth as the bot id "+botId, player.id);
          window.messageToServer("onBotAuthentification", { botId: botId, roomId: player.id });
          players[player.id].bot = true;
        }
      }
      return false;
    }
    return true;
  }

  room.onPlayerActivity = function(player) {
    if(!(player.id in players)) {
      return;
    }
    players[player.id].lastActivityTime = Date.now();
  }

  var kickAfkPlayers = function() {
    if(!gameInProgress) {
      return;
    }

    var dateNow = Date.now();
    room.getPlayerList().forEach(player => {
      if(!(player.id in players) || player.admin || player.team == 0 || players[player.id].bot) {
        return;
      }

      var deltaTime = dateNow - players[player.id].lastActivityTime;
      if(deltaTime > 15000) {
        room.kickPlayer(player.id, "You were AFK", false);
      }
    });
  }
  setInterval(kickAfkPlayers, 2000);
  return room;
}


module.exports = { createHaxballRoom };
