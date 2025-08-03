import {
  sendMessageToAllBots
} from "./server_functions.js";
import { publish } from "./natsClient.js";
export async function onGameTick(data, server) {
  sendMessageToAllBots(server.bots, "onGameTick", data);
}

export async function onPlayerJoin(data, _server) {
  console.log(data + " has joined the room");
}

export async function onPlayerLeave(data, server) {
  if (data.botName) {
    if (data.botName in server.bots) {
      delete server.bots[data.botName];
      console.log("The bot id " + data.botName + " has left the room");
    } else {
      console.error(
        "The bot id " + data.botName + " doesn't exist in the server",
      );
    }
  } else {
    console.log(data + " has left the room");
  }
}

export async function onPositionsReset(_data, server) {
  sendMessageToAllBots(server.bots, "onPositionsReset", {});
}

export async function onGameStart(data, server) {
  sendMessageToAllBots(server.bots, "onGameStart", {});
}

export async function onBotAuthentification(data, server) {
  sendMessageToAllBots(server.bots, "onBotAuthentification", data);
  const message = { roomLink: server.roomLink, adminToken: server.admin, roomPassword: server.password };
  publish('backend.ready', message);
}
