import { launchAgent } from "./src/bot.js";
import { subscribe } from "./src/natsClient.js";

subscribe(
  "backend.ready",
  async (data) => {
    await launchAgent(data.roomLink, data.adminToken, data.roomPassword);
  },
  1,
  "operators",
);

process.stdin.resume();
