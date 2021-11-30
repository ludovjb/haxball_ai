const { ArgumentParser } = require('argparse');
const { launchServer } = require('./server.js')

const DEFAULT_PASSWORD = "caen";

const parser = new ArgumentParser({
  description: 'haxball_ai'
});

parser.add_argument('token', { help: 'Recaptcha token' });
parser.add_argument('-n', '--name', { help: 'Room name', default: 'HaxBall AI Room' });
parser.add_argument('-p', '--password', { help: 'Room password (maxlength=30)', default: DEFAULT_PASSWORD, type: checkPasswordValue });
parser.add_argument('-b', '--bots', { help: 'Number of bots', type: 'int', default: 2});
parser.add_argument('-v', '--verbose', { help: 'Verbose flag', default: false });
parser.add_argument('--vps', { help: 'If the server will be running on a VPS', action: 'store_true' });

args = parser.parse_args();

if(args.verbose) {
  console.dir(args);
}

launchServer(args.roomname, args.password, args.token, args.bots, args.vps, args.verbose);

function checkPasswordValue(password) {
  if(password.length > 30) {
    console.error("Given password is too long (maxlength = 30). Default password ('"+DEFAULT_PASSWORD+"') is set.");
    return DEFAULT_PASSWORD;
  }
  return password;
}
