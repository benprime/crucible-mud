module.exports = {
  WelcomeMessageOld: function(socket) {
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
  },

  WelcomeMessage: function(socket) {
    //made with http://patorjk.com/software/taag/#p=display&f=Delta%20Corps%20Priest%201&t=Crucible%0A%20%20%20%20%20MUD
    //and http://patorjk.com/text-color-fader/
s = '<pre><div><span style="color:#b12020;">   ▄████████  ▄████████ ███    █▄   ▄████████  ▄█  ▀█████████▄   ▄█        ▄████████ </span></div>';
    s += '<div><span style="color:#b72c24;">  ███    ███ ███    ███ ███    ███ ███    ███ ███    ███    ███ ███       ███    ███ </span></div>';
    s += '<div><span style="color:#be3728;">  ███    ██▀ ███    ███ ███    ███ ███    █▀  ███▌   ███    ███ ███       ███    █▀  </span></div>';
    s += '<div><span style="color:#c4432c;">  ███    ▀  ▄███▄▄▄▄██▀ ███    ███ ███        ███▌  ▄███▄▄▄██▀  ███      ▄███▄▄▄     </span></div>';
    s += '<div><span style="color:#ca4f30;">  ███      ▀▀███▀▀▀▀▀   ███    ███ ███        ███▌ ▀▀███▀▀▀██▄  ███     ▀▀███▀▀▀     </span></div>';
    s += '<div><span style="color:#d15a34;">  ███      ▀███████████ ███    ███ ███    █▄  ███    ███    ██▄ ███       ███    █▄  </span></div>';
    s += '<div><span style="color:#d76638;">  ███    █▄  ███    ███ ███    ███ ███    ███ ███    ███    ███ ███▌    ▄ ███    ███ </span></div>';
    s += '<div><span style="color:#cf5833;">  ███    ███ ███    ███ ████████▀  ████████▀  █▀   ▄█████████▀  █████▄▄██ ██████████ </span></div>';
    s += '<div><span style="color:#c84a2e;">  ████████▀  ███    ███                                         ▀                      </span></div>';
    s += '<div><span style="color:#c03c2a;">                           ▄▄▄▄███▄▄▄▄   ███    █▄  ████████▄                          </span></div>';
    s += '<div><span style="color:#b92e25;">                         ▄██▀▀▀███▀▀▀██▄ ███    ███ ███   ▀███                         </span></div>';
    s += '<div><span style="color:#b12020;">                         ███   ███   ███ ███    ███ ███    ███                         </span></div>';
    s += '<div><span style="color:#b72c24;">                         ███   ███   ███ ███    ███ ███    ███                         </span></div>';
    s += '<div><span style="color:#be3728;">                         ███   ███   ███ ███    ███ ███    ███                         </span></div>';
    s += '<div><span style="color:#c4432c;">                         ███   ███   ███ ███    ███ ███    ███                         </span></div>';
    s += '<div><span style="color:#ca4f30;">                         ███   ███   ███ ███    ███ ███   ▄███                         </span></div>';
    s += '<div><span style="color:#d15a34;">                          ▀█   ███   █▀  ████████▀  ████████▀                          </span></div>';
    s += '<div><span style="color:#d76638;">                                                                  </span></div></pre>';
    socket.emit('output', { message: s });
  }
}
