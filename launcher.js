const { ArgumentParser } = require('argparse');
const conf = require('./src/config.js');
const { launchServer } = require('./src/server.js');
const { checkPasswordValue, checkAIActionFile } = require('./src/server_functions.js')

const parser = new ArgumentParser();

parser.add_argument('token', { help: 'Recaptcha token' });
parser.add_argument('-n', '--name', { help: 'Room name', default: 'HaxBall AI Room' });
parser.add_argument('-p', '--password', { help: 'Room password (maxlength=30)', default: conf.DEFAULT_PASSWORD, type: checkPasswordValue });
parser.add_argument('-b', '--bots', { help: 'Number of bots', type: 'int', default: 1});
parser.add_argument('--redteam', { help: 'AI action file', type: checkAIActionFile, default: conf.DEFAULT_AI_FILE });
parser.add_argument('--blueteam', { help: 'AI action file', type: checkAIActionFile, default: conf.DEFAULT_AI_FILE });
parser.add_argument('--admin', { help: 'Admin token', default: conf.DEFAULT_ADMIN_TOKEN });
parser.add_argument('-v', '--verbose', { help: 'Verbose flag', action: 'store_true' });
parser.add_argument('--vps', { help: 'If the server will be running on a VPS', action: 'store_true' });
parser.add_argument('--nocache', { help: 'If you want to reload agent file every second (for dev purposes)', action: 'store_true' });

args = parser.parse_args();

if(args.verbose) {
  console.dir(args);
}

launchServer(args);
