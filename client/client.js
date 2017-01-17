  var commandHistory = [];
  var historyIndex = -1;

  var socket = io("http://localhost:3000");

  socket.on('output', function(data) {
    var ta = document.getElementById('log');

    var newHTML = data.message.replace(/\n/g, '<br />\n');
    ta.innerHTML = ta.innerHTML + newHTML + '<br />';
    ta.scrollTop = ta.scrollHeight;
  });

  function sendData(e) {
    if (!e) e = window.event;
    var tb = document.getElementById("textData");
    var keyCode = e.keyCode || e.which || e.charCode;

    // esc
    if (keyCode === 27) {
      tb.value = '';
      historyIndex = -1;
    }

    // up arrow
    if (keyCode == 38) {
      historyIndex++;
      if (historyIndex > commandHistory.length - 1) historyIndex = commandHistory.length - 1;
      tb.value = commandHistory[historyIndex];
    }

    // down arrow
    if (keyCode == 40) {

      // if you push the down arrow when history index is already 0, just blank the field and return.
      historyIndex--;
      if (historyIndex > -1) {
        tb.value = commandHistory[historyIndex];
      } else {
        tb.value = '';
      }
      if (historyIndex < -1) historyIndex = -1;
    }

    // enter press
    if (keyCode == 13) {
      socket.emit('command', {
        value: tb.value
      });
      commandHistory.unshift(tb.value); // save command
      commandHistory.splice(25); // only save 25 commands
      historyIndex = -1;
      tb.value = '';
      return false;
    }
  }

  function focusInput() {
    document.getElementById("textData").focus();
  }