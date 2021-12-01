async function createHaxballRoom(serverName, password, token) {
  var room = window.HBInit({
    roomName: serverName,
    password: password ? password : null,
    maxPlayers: 16,
    noPlayer: true,
    public: false,
    token: token
  });

  room.setTimeLimit(0);
  room.setScoreLimit(0);
  room.setDefaultStadium("Classic");

  room.onPlayerJoin = function(player) {
    window.messageToServer("onPlayerJoin", player.name);
    if(player.name == "LL") {
      room.setPlayerAdmin(player.id, true);
    }

    if(player.name.startsWith("Bot_")) {
      let teamNumber = (parseInt(player.name.substring(4)) - 1) % 2 + 1;
      console.log(player.name +" is team number "+ teamNumber);
      room.setPlayerTeam(player.id, teamNumber);
      if(room.getPlayerList().filter((player) => player.name.startsWith("Bot_")).length == 2) {
        room.startGame();
      }
    }
  }

  var tickNumber = 0;

  room.onGameTick = function() {
    tickNumber++;
    //var playerList = room.getPlayerList();
    var data = {};
    data.ball = room.getBallPosition();
    data.players = room.getPlayerList();
    data.tickNumber = tickNumber;
    window.messageToServer("onGameTick", data);
  }

  room.onPlayerChat = function(player, message) {
    window.messageToServer("onPlayerChat", message); //.substring(2));
    /*if(message.startsWith('!!')) {
      window.messageToServer("onPlayerChat", message.substring(2));
      return false;
    }*/
    return true;
  }

  return room;
}


module.exports = { createHaxballRoom };
