  var commandHistory = [];
  var historyIndex = -1;
  var socket = io("http://localhost:3000");

  var actionNotifySound = new Audio('cardSlide1.wav');
  socket.on('output', function(data) {
    var ta = document.getElementById('log');
    var atBottom = (ta.scrollHeight - ta.scrollTop) === ta.clientHeight;
    var newHTML = data.message.replace(/\n/g, '<br />\n');
    ta.innerHTML = ta.innerHTML + newHTML + '<br />';
    if(atBottom) {
      ta.scrollTop = ta.scrollHeight;
    } else {
      var actionNotifyIcon = document.getElementById('actionNotify');
      actionNotifyIcon.style.display = 'block';
      actionNotifySound.play();
    }

    /*
    if(data.message.includes('You say "boogie"')) {
      ta.classList.toggle('shake');
      console.log(ta.class);
    }
    */
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
    if (keyCode === 38) {
      historyIndex++;
      if (historyIndex > commandHistory.length - 1) historyIndex = commandHistory.length - 1;
      tb.value = commandHistory[historyIndex];
      return false;
    }

    // down arrow
    if (keyCode === 40) {

      // if you push the down arrow when history index is already 0, just blank the field and return.
      historyIndex--;
      if (historyIndex > -1) {
        tb.value = commandHistory[historyIndex];
      } else {
        tb.value = '';
      }
      if (historyIndex < -1) historyIndex = -1;
      return false;
    }

    // enter press
    if (keyCode === 13) {
      var input = tb.value.trim();
      socket.emit('command', {
        value: input
      });
      // only save command if it wasn't blank
      if (tb.value && input !== '') {
        // only save command if it doesn't match the last one
        if(commandHistory.length === 0 || commandHistory[0] !== input)
        {
          commandHistory.unshift(input); // save command
          commandHistory.splice(25); // only save 25 commands
          historyIndex = -1;
        }
      }
      tb.value = '';
      return false;
    }
  }

  function focusInput() {
    document.getElementById("textData").focus();
  }
