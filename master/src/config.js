import crypto from "crypto";

export const DEFAULT_PASSWORD = "!pss";
export const DEFAULT_AI_FILE = "../agents/simple_ai.js";
export const DEFAULT_ADMIN_TOKEN = crypto.randomBytes(10).toString("hex");
export const SPECTATORS = 0;
export const RED_TEAM = 1;
export const BLUE_TEAM = 2;
export const DELAY_BEFORE_PLAY = 30;
export const MAX_DELAY_BEFORE_PLAY = 9999;
