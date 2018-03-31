export NODE_PORT=3000
export MONGO_DB=mud
export MONGO_PORT=27017

nodemon ~/mud/server.js
#forever start ~/mud/server.js -e ~/logs/err.log -o ~/logs/out.log -l ~/logs/forever.log 

