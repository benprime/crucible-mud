export NODE_PORT=3001
export MONGO_DB=develop
export MONGO_PORT=27017
export MAIL_GUN_API_KEY=
export MAIL_GUN_DOMAIN=cruciblemud.com

# Used by the socker server to determind development mode (not used by frontend)
export NODE_ENV=dev

# attempt to restart the service or, if it is not running, start it.
forever restart ~/$NODE_ENV/server.js || forever start -e ~/logs/$NODE_ENV-err.log -o ~/logs/$NODE_ENV-out.log -l ~/logs/$NODE_ENV-forever.log -a ~/$NODE_ENV/server.js

