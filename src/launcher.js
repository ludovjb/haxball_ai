const { ArgumentParser } = require('argparse');
const conf = require('./config.js');
const { launchServer } = require('./server.js')

const parser = new ArgumentParser({
  description: 'haxball_ai'
});

parser.add_argument('token', { help: 'Recaptcha token' });
parser.add_argument('-n', '--name', { help: 'Room name', default: 'HaxBall AI Room' });
parser.add_argument('-p', '--password', { help: 'Room password (maxlength=30)', default: conf.DEFAULT_PASSWORD, type: checkPasswordValue });
parser.add_argument('-b', '--bots', { help: 'Number of bots per team', type: 'int', default: 1});
parser.add_argument('--redteam', { help: 'AI action file', type: checkAIActionFile, default: conf.DEFAULT_AI_FILE });
parser.add_argument('--blueteam', { help: 'AI action file', type: checkAIActionFile, default: conf.DEFAULT_AI_FILE });
parser.add_argument('--admin', { help: 'Admin token', default: conf.DEFAULT_ADMIN_TOKEN });
parser.add_argument('-v', '--verbose', { help: 'Verbose flag', action: 'store_true' });
parser.add_argument('--vps', { help: 'If the server will be running on a VPS', action: 'store_true' });

args = parser.parse_args();

if(args.verbose) {
  console.dir(args);
}

launchServer(args.name, args.password, args.token, args.bots, args.redteam, args.blueteam, args.admin, args.vps, args.verbose);

function checkPasswordValue(password) {
  if(password.length > 30) {
    console.error("Given password is too long (maxlength = 30). Default password ('"+conf.DEFAULT_PASSWORD+"') is set.");
    return conf.DEFAULT_PASSWORD;
  }
  return password;
}

function checkAIActionFile(fileName) {
  try {
    const { action } = require(fileName);
  } catch (error) {
    console.error("An error has occured with the following action file : "+fileName);
    console.error(error);
    process.exit(1);
  }
  return fileName;
}
