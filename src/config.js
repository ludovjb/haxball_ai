var crypto = require("crypto");

const DEFAULT_PASSWORD = "!pss";
const DEFAULT_AI_FILE = "agents/simple_ai"
const DEFAULT_ADMIN_TOKEN = crypto.randomBytes(10).toString('hex');
const SPECTATORS = 0;
const RED_TEAM = 1;
const BLUE_TEAM = 2;
const DELAY_BEFORE_PLAY = 30;
const MAX_DELAY_BEFORE_PLAY = 9999;

module.exports = { DEFAULT_PASSWORD, DEFAULT_AI_FILE, SPECTATORS, RED_TEAM, BLUE_TEAM, DEFAULT_ADMIN_TOKEN, DELAY_BEFORE_PLAY, MAX_DELAY_BEFORE_PLAY };
