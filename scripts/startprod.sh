export NODE_PORT=3000
export MONGO_DB=mud
export MONGO_PORT=27017
export MAIL_GUN_API_KEY=
export MAIL_GUN_DOMAIN=

# Used by the socker server to determind development mode (not used by frontend)
export NODE_ENV=prod

# attempt to restart the service or, if it is not running, start it.
/root/.nvm/versions/node/v14.15.0/bin/forever restart ~/$NODE_ENV/dist/server.js || /root/.nvm/versions/node/v14.15.0/bin/forever start -e ~/logs/$NODE_ENV-err.log -o ~/logs/$NODE_ENV-out.log -l ~/logs/$NODE_ENV-forever.log -a ~/$NODE_ENV/dist/server.js
