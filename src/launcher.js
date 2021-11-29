const { ArgumentParser } = require('argparse');
const { launchServer } = require('./server.js')

const parser = new ArgumentParser({
  description: 'Argparse example'
});

parser.add_argument('token', { help: 'Recaptcha token' });
parser.add_argument('-n', '--name', { help: 'Room name', default: 'HaxBall AI Room' });
parser.add_argument('-p', '--password', { help: 'Room password', default: 'caen' });
parser.add_argument('-b', '--bots', { help: 'Number of bots', type: 'int', default: 2});
parser.add_argument('-v', '--verbose', { help: 'Verbose flag', default: false });

args = parser.parse_args();
console.dir(args);

launchServer(args.roomname, args.password, args.token, args.bots, args.verbose);
