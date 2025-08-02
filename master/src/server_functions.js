import * as conf from "./config.js";
import { publish } from "./natsClient.js";

export function checkPasswordValue(password) {
  if (password.length > 30) {
    console.error(
      "Given password is too long (maxlength = 30). Default password ('" +
        conf.DEFAULT_PASSWORD +
        "') is set.",
    );
    return conf.DEFAULT_PASSWORD;
  }
  return password;
}


export async function sendMessageToAllBots(bots, callbackName, data) {
  publish("backend.message", { callback: callbackName, data: data })
}