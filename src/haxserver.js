
async function createHaxballRoom(serverName, password, recaptchaToken, adminToken) {
  const teamNames = ["Spectators", "Red team", "Blue team"];
  var tickNumber = 0;

  var room = window.HBInit({
    roomName: serverName,
    password: password ? password : null,
    maxPlayers: 16,
    noPlayer: true,
    public: false,
    token: recaptchaToken
  });

  room.setTimeLimit(0);
  room.setScoreLimit(0);
  room.setDefaultStadium("Classic");

  room.onPlayerJoin = function(player) {
    window.messageToServer("onPlayerJoin", player.name);
    room.setPlayerAdmin(player.id, true);
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
  }

  room.onPositionsReset = function() {
    window.messageToServer("onPositionsReset", {});
  }

  room.onGameStart = function(byPlayer) {
    tickNumber = 0;
    window.messageToServer("onGameStart", {});
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

      else if(args[0] == '!moveteam') {
        if(args[1] != adminToken) {
          room.sendAnnouncement("Wrong token!", player.id);
        }
        else if(args[2] == "0" || args[2] == "1" || args[2] == "2") {
          var team = parseInt(args[2]);
          room.setPlayerTeam(player.id, team);
          room.sendAnnouncement("You have been moved to "+teamNames[team], player.id);
        }
      }

      return false;
    }
    return true;
  }

  return room;
}


module.exports = { createHaxballRoom };
