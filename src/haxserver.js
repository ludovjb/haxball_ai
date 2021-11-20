async function createHaxballServer(serverName, password, token) {
  var room = window.HBInit({
    roomName: serverName,
    //password: password,
    maxPlayers: 16,
    noPlayer: true,
    public: false,
    token: token
  });

  var i =0;

  // If there are no admins left in the room give admin to one of the remaining players.
  function updateAdmins() {
    // Get all players
    var players = room.getPlayerList();
    if ( players.length == 0 ) return; // No players left, do nothing.
    if ( players.find((player) => player.admin) != null ) return; // There's an admin left so do nothing.
    room.setPlayerAdmin(players[0].id, true); // Give admin to the first non admin player in the list
    room.sendAnnouncement("you are now admin", players[0].id);
  }

  room.onPlayerJoin = function(player) {
    updateAdmins();
    window.letMeKnowPlayerHasJoined(player.name);
  }

  room.onPlayerLeave = function(player) {
    //updateAdmins();
  }

  room.onPlayerBallKick = function(data) {
    i++;
    window.ballKicked(i);
  }

  return room;
}


module.exports = { createHaxballServer };
