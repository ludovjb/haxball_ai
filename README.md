# haxball_ai

- Install the dependencies (Node.js version 17) :
`npm install`

- Read the doc about optional args :
`node src/launcher --help`

```
usage: launcher.js [-h] [-n NAME] [-p PASSWORD] [-b BOTS] [--redteam REDTEAM] [--blueteam BLUETEAM] [--admin ADMIN] [-v] [--vps] token

haxball_ai

positional arguments:
  token                 Recaptcha token

optional arguments:
  -h, --help            show this help message and exit
  -n NAME, --name NAME  Room name
  -p PASSWORD, --password PASSWORD
                        Room password (maxlength=30)
  -b BOTS, --bots BOTS  Number of bots per team
  --redteam REDTEAM     AI action file
  --blueteam BLUETEAM   AI action file
  --admin ADMIN         Admin token
  -v, --verbose         Verbose flag
  --vps                 If the server will be running on a VPS
  ```

- Launch the server with a token from [here](https://www.haxball.com/headlesstoken) :
`node src/launcher {token}`

## AI agents

This project allows to build AI agents by defining the action function, in a single .js file. An example is given [here](src/simple_ai.js).

### Environment

The action function has a single argument, which is a javascript object that contains information about the agent's environment at a specific time (tick). According to the [haxball's documentation](https://github.com/haxball/haxball-issues/wiki/Headless-Host), the room generates 60 ticks per second.

An example of environment is given below :
```yaml
{
  tick: 5460, # tick number, it increments over time
  bot: { # information about the agent
    id: 2,
    team: 2,
    position: { x: -95.12638910445014, y: 5.238943662721164 },
    velocity: { x: -0.2696446592441646, y: 0.019327265448680464 }
  },
  score: { # current score of the game, time and game limits (0 = no limit)
    ownTeam: 3,
    opponentTeam: 1,
    scoreLimit: 0,
    time: 67.63333333333078,
    timeLimit: 0
  },
  ball: { # position and velocity of the ball
    position: { x: 18.69187243117962, y: 52.79837094705513 },
    velocity: { x: -1.0877633731164025, y: 2.8777000702357896 }
  },
  teammates: {}, # array of teammates' informations (empty in the case 1vs1)
  opponents: { '0': { 
      id: 1, 
      position: { x: 165.6799308196819, y: -15.660684360357726 },
      velocity: { x: 2.0892143863467822, y: -0.9913321553464236 } 
    } 
  } # array of the opponents' informations
}
```
 
 #### Position vectors
 
All the position vectors (ball, teammates and opponents) are relative to the agent position. The latter is relative to the center of the pitch : (0, 0).
 
 #### Velocity vectors
 
All velocity vectors are defined as the movement delta between the previous tick (tick-1) positions and the current ones.
 
