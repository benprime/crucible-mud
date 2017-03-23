'use strict';

let handlers = [];

const normalizedPath = require("path").join(__dirname);

console.log("path:", normalizedPath);

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  if (file != "index.js") {
    let module = require("./" + file);
    
    // initialization checks
    if(!module.name) throw `command ${file} missing name!`;
    if(!module.dispatch) throw `command ${file} missing dispatch!`;
    if(!module.execute) throw `command ${file} missing execute!`;
    if(!module.patterns) throw `command ${file} missing patterns!`;
    if(!module.help) throw `command ${file} missing help!`;

    handlers.push(module);
  }
});

// when loading the action do some basic checks and throw exceptions if all the required properties are not met


module.exports = {
  Dispatch(socket, input) {
    input = input.trim();

    // check if input string matches any of our matching patterns.
    // then call the handler with the input, socket
    for (let h = 0; h < handlers.length; h++) {
      // todo: if we find we need to use match later to pull things out of the string,
      // then just update this to do a match instead of a test. No sense doing it twice.
      for (let p = 0; p < handlers[h].patterns.length; p++) {
        let match = input.match(handlers[h].patterns[p]);
        if (match) {
          handlers[h].dispatch(socket, match);
          return;
        }
      }

      // invalid command goes here
    }
  }
}
