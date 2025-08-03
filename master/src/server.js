import puppeteer from "puppeteer";
import { createHaxballRoom } from "./haxserver.browser.js";
import * as roomCallbacks from "./server_callbacks.js";
import * as browserFunctions from "./functions.browser.js";
import open from "open";
import { publish } from "./natsClient.js";

let browser = null;
let server = {};

export async function launchServer(args) {
  Object.assign(server, args);

  var browserParams = { dumpio: server.verbose, args: ["--no-sandbox"] };
  if (server.vps) {
    browserParams.args.push(["--disable-features=WebRtcHideLocalIpsWithMdns"]);
  }
  browser = await puppeteer.launch(browserParams);
  const page = await browser.newPage();

  await page.setViewport({ width: 2, height: 2 });
  await page.goto("https://www.haxball.com/headless");
  await page.waitForFunction("window.HBInit");
  await page.waitForSelector("iframe");

  var frames = await page.frames();
  var gameFrame = frames.find(
    (f) => f.url().indexOf("__cache_static__/g/headless.html") > -1,
  );

  await page.exposeFunction("messageToServer", onRoomMessage);

  page.evaluate(
    createHaxballRoom,
    server.name,
    server.password,
    server.token,
    server.admin,
  );

  const selectorRoomLink = "#roomlink p a";
  try {
    await gameFrame.waitForSelector(selectorRoomLink, { timeout: 3000 });
  } catch {
    console.log("Invalid token ! ");
    browser.close();
    return;
  }

  server.roomLink = await gameFrame.evaluate(
    browserFunctions.getRoomLink,
    selectorRoomLink,
  );

  if (!server.vps) {
    open(server.roomLink);
  }

  console.log("**************************************************");
  console.log("The room link is :");
  console.log("");
  console.log(server.roomLink);
  console.log("");
  console.log("The room password is : " + server.password);
  console.log("The admin token is : " + server.admin);
  console.log("**************************************************");

  const message = {
    roomLink: server.roomLink,
    adminToken: server.admin,
    roomPassword: server.password,
  };
  publish("backend.ready", message);
  process.stdin.resume();
}

async function onRoomMessage(callback, data) {
  if (
    callback in roomCallbacks &&
    typeof roomCallbacks[callback] === "function"
  ) {
    roomCallbacks[callback](data, server);
  } else {
    console.error(
      "The following server callback function doesn't exist : " + callback,
    );
  }
}

function cleanExit() {
  browser.close();
  console.log("Server exited.");
  process.exit();
}
process.on("SIGINT", cleanExit); // catch ctrl-c
process.on("SIGTERM", cleanExit); // catch kill
