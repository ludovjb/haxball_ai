const RED_TEAM = 1;
const BLUE_TEAM = 2;

const keyHold = {};

async function action(team, actionName, page) {
  if(team != RED_TEAM && team != BLUE_TEAM) {
    await resetAllKeysExceptFor(page);
    return;
  }

  switch(actionName) {
    case "kick": case "k":
      await pressKeys(page, getCommandKeys(team, "kick"));
      break;
    case "forward": case "f":
      await pressKeys(page, getCommandKeys(team, "forward"));
      break;
    case "backward": case "b":
      await pressKeys(page, getCommandKeys(team, "backward"));
      break;
    case "left": case "l":
      await pressKeys(page, getCommandKeys(team, "left"));
      break;
    case "right": case "r":
      await pressKeys(page, getCommandKeys(team, "right"));
      break;
    case "forward-left": case "fl":
      await pressKeys(page, getCommandKeys(team, "forward"), getCommandKeys(team, "left"));
      break;
    case "forward-right": case "fr":
      await pressKeys(page, getCommandKeys(team, "forward"), getCommandKeys(team, "right"));
      break;
    case "backward-left": case "bl":
      await pressKeys(page, getCommandKeys(team, "backward"), getCommandKeys(team, "left"));
      break;
    case "backward-right": case "br":
      await pressKeys(page, getCommandKeys(team, "backward"), getCommandKeys(team, "right"));
      break;
    default: // none
      await resetAllKeysExceptFor(page);
      break;
  }
}

function getCommandKeys(team, commandName) {
  switch (commandName) {
    case "forward":
      return team == RED_TEAM ? "ArrowRight" : getOppositeCommand("ArrowRight");
    case "backward":
      return team == RED_TEAM ? "ArrowLeft" : getOppositeCommand("ArrowLeft");
    case "right":
      return team == RED_TEAM ? "ArrowDown" : getOppositeCommand("ArrowDown");
    case "left":
      return team == RED_TEAM ? "ArrowUp" : getOppositeCommand("ArrowUp");
    case "kick":
      return "Space";
  }
}

function getOppositeCommand(commandKey) {
  switch (commandKey) {
    case "ArrowUp":
      return "ArrowDown";
    case "ArrowRight":
      return "ArrowLeft";
    case "ArrowDown":
      return "ArrowUp";
    case "ArrowLeft":
      return "ArrowRight";
  }
}

async function pressKeys(page, ...commandKeys) {
  await resetAllKeysExceptFor(page, ...commandKeys);
  commandKeys.forEach(async (commandKey, i) => {
    if(!(commandKey in keyHold) || !keyHold[commandKey]) {
      await page.keyboard.down(commandKey);
      keyHold[commandKey] = true;
      //console.log(" press "+commandKey)
    }
    /*else {
      console.log(" not press "+commandKey);
    }*/
  });
}

async function resetAllKeysExceptFor(page, ...exceptions) {
  Object.keys(keyHold).forEach(async (commandKey, i) => {
    if(keyHold[commandKey] && !exceptions.includes(commandKey)) {
      await page.keyboard.up(commandKey);
      keyHold[commandKey] = false;
      //console.log(" reset "+commandKey)
    }
  });
}

module.exports = { action, resetAllKeysExceptFor }
