const { launchServer } = require('./server.js')

const roomName = process.argv[2];
if (!roomName) {
    throw "Please provide a room name as a first argument";
}

const roomPassword = process.argv[3];
if (!roomPassword) {
    throw "Please provide a room password as a second argument";
}

const recaptchaToken = process.argv[4]
if(!recaptchaToken) {
  throw "Please provide a repcaptcha token as a third argument";
}

const numberOfBots = 2;

launchServer(roomName, roomPassword, recaptchaToken, numberOfBots, true);
