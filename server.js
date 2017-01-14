var express = require('express');
var app = express();
var http = require('http');
var serve = http.createServer(app);
var io = require('socket.io')(serve);
var dirUtil = require('./direction');
var adminUtil = require('./admin')(io);
var loginUtil = require('./login')(io);
var globals = require('./globals');
var commands = require('./commands')(io);
var mongo = require('mongodb').MongoClient;

module.exports = io;

function WelcomeMessage(socket) {
  // Generated from: http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=WELCOME%0AMUDDERS!
  var s = '<br /><br /><pre><span class="teal">';
  s += '██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗ <br />';
  s += '██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝ <br />';
  s += '██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗   <br />';
  s += '██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝   <br />';
  s += '╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗ <br />';
  s += ' ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝ <br />';
  s += '<br />';
  s += '███╗   ███╗██╗   ██╗██████╗ ██████╗ ███████╗██████╗ ███████╗██╗<br />';
  s += '████╗ ████║██║   ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝██║<br />';
  s += '██╔████╔██║██║   ██║██║  ██║██║  ██║█████╗  ██████╔╝███████╗██║<br />';
  s += '██║╚██╔╝██║██║   ██║██║  ██║██║  ██║██╔══╝  ██╔══██╗╚════██║╚═╝<br />';
  s += '██║ ╚═╝ ██║╚██████╔╝██████╔╝██████╔╝███████╗██║  ██║███████║██╗<br />';
  s += '╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝</span><br /></pre>';

  var bgChars = ['╔', '╗', '║', '╚', '╝', '═'];
  for (i in bgChars) {
    s = s.replace(new RegExp(bgChars[i], 'g'), '<span class="mediumOrchid">' + bgChars[i] + '</span>');
  }
  socket.emit('output', { message: s });
}

app.set('port', 3000);
var url = 'mongodb://localhost:27017/mud';

mongo.connect(url, function(err, db) {
  if (!db) {
    console.log("Could not connect to mongo! " + err)
    process.exit(-1);
  }

  // set a global reference to the database
  globals.DB = db;

  io.on('connection', function(socket) {
    //console.log('a user connected');
    socket.state = globals.STATES.LOGIN_USERNAME;
    socket.emit('output', { message: "Connected." });
    WelcomeMessage(socket);
    socket.emit('output', { message: "Enter username:" });



    socket.on('disconnect', function() {
      // check to see if this user ever successfully logged in
      if(socket.id in globals.USERNAMES) {
        socket.broadcast.emit('output', { message: globals.USERNAMES[socket.id] + ' has left the realm.' });
        delete globals.USERNAMES[socket.id];
      }
    });

    socket.on('command', function(data) {
      switch (socket.state) {
        case globals.STATES.MUD:
          commands.CommandDispatch(socket, data);
          break;
        case globals.STATES.LOGIN_USERNAME:
          loginUtil.LoginUsername(socket, data);
          break;
        case globals.STATES.LOGIN_PASSWORD:
          loginUtil.LoginPassword(socket, data, function(socket) {
            commands.Look(socket);
          });
          break;
      }
    });

  });

  serve.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});
