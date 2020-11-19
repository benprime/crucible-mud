# CrucibleMUD [![Build Status](https://www.travis-ci.com/benprime/crucible-mud.svg?branch=develop)](https://www.travis-ci.com/benprime/crucible-mud)
CrucibleMUD is a massively multiplayer online text game, utilizing web sockets for realtime player interaction. Game elements are data-driven to support in-game world crafting via in-game commands. The intent is to provide privileged users with the ability to create game environments, interactions, and events with no programming required.

## Environments
CrucibleMUD environments are auto-deployed upon merging to their respective branches.

| Environment | Branch |
| - | - |
| [Production](http://www.cruciblemud.com) | [master](https://github.com/benprime/crucible-mud/tree/master) |
| [Development](http://develop.cruciblemud.com) | [develop](https://github.com/benprime/crucible-mud/tree/develop) |

## Configuration

The following environment variables can be set to override the CrucibleMUD default configuration.

```
NODE_PORT=3000
MONGO_HOST=localhost
MONGO_DB=mud
MONGO_PORT=27017
APP_URL=http://localhost:3001
TOKEN_SECRET=SUPER-SECRET
```
