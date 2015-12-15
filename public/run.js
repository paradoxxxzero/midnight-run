'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var socket = io(),
    players = {},
    game_state = 'not started';

var player_name = 'Unnamed';
if (!localStorage.getItem('midnigth_name')) {
  player_name = localStorage.midnigth_name = prompt('Enter your name');
} else {
  player_name = localStorage.getItem('midnigth_name');
}

var Player = (function () {
  function Player(name, color) {
    var _this = this;

    var position = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, Player);

    this.tracks = document.querySelector('.tracks');
    this.player = document.createElement('div');
    this.player.setAttribute('data-name', name);
    this.player.classList.add('player');
    this.runner = document.createElement('span');
    this.runner.classList.add('runner');
    this.runner.style['background-color'] = color;
    this.runner.style['border-color'] = color;
    this.player.appendChild(this.runner);
    this.tracks.appendChild(this.player);
    this.tracks.style.display = 'none';
    this.name = name;
    setTimeout(function () {
      return _this.tracks.style.display = 'flex';
    }, 10);

    this.position = position;
  }

  _createClass(Player, [{
    key: 'ready',
    value: function ready() {
      this.player.classList.add('ready');
    }
  }, {
    key: 'unready',
    value: function unready() {
      this.player.classList.remove('ready');
    }
  }, {
    key: 'move',
    value: function move(position) {
      this.position = Math.min(position, 100);
      this.runner.style['margin-top'] = this.position + 'vmin';
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.tracks.removeChild(this.player);
    }
  }]);

  return Player;
})();

document.addEventListener('DOMContentLoaded', function () {
  // Animate lauch
  setTimeout(function () {
    return document.body.classList.add('third-dimension');
  }, 100);
  var id = Math.random();
  var key_state = '';
  var ready_state = 'unready';
  var errors = 0;
  addEventListener('keydown', function (e) {
    if (game_state == 'not started') {
      if (ready_state == 'ready') {
        return;
      }
      if (e.keyCode == 37) {
        // left
        if (ready_state == 'right') {
          socket.emit('ready');
          ready_state = 'ready';
        } else {
          ready_state = 'left';
        }
      } else if (e.keyCode == 39) {
        // right
        if (ready_state == 'left') {
          ready_state = 'ready';
          socket.emit('ready');
        } else {
          ready_state = 'right';
        }
      }
    } else if (game_state == 'started') {
      if (e.keyCode == 37) {
        // left
        if (key_state == 'right') {
          if (errors <= 0) {
            socket.emit('step');
          } else {
            errors--;
          }
          key_state = 'left';
        } else {
          if (key_state != '') {
            errors++;
            key_state = 'error';
          } else {
            key_state = 'left';
          }
        }
        key_state = 'left';
      } else if (e.keyCode == 39) {
        // right
        if (key_state == 'left') {
          if (errors <= 0) {
            socket.emit('step');
          } else {
            errors--;
          }
          key_state = 'right';
        } else {
          if (key_state != '') {
            errors++;
            key_state = 'error';
          } else {
            key_state = 'right';
          }
        }
      }
    }
  });
  addEventListener('keyup', function (e) {
    if (game_state == 'not started') {
      if (ready_state == 'ready') {
        if (e.keyCode == 37) {
          // left
          ready_state = 'right';
          socket.emit('unready');
        } else if (e.keyCode == 39) {
          // right
          ready_state = 'left';
          socket.emit('unready');
        }
      }
      if (ready_state == 'left' && e.keyCode == 37) {
        // left
        ready_state = 'unready';
      } else if (ready_state == 'right' && e.keyCode == 39) {
        // right
        ready_state = 'unready';
      }
    }
  });
  // Init player
  socket.on('new player', function (player) {
    return players[player.id] = new Player(player.name, player.color);
  });
  socket.on('del player', function (id) {
    players[id].remove();
    delete players[id];
  });
  socket.on('state', function (state) {
    return game_state = state;
  });
  socket.on('echo', function (message) {
    return document.querySelector('.echo').innerHTML = message;
  });
  socket.on('position', function (_ref) {
    var id = _ref.id;
    var position = _ref.position;
    return players[id].move(position);
  });
  socket.on('disconnect', function () {
    return setTimeout(function () {
      return location.reload(true);
    }, 500);
  });
  socket.on('ready', function (id) {
    return players[id].ready();
  });
  socket.on('unready', function (id) {
    return players[id].unready();
  });
  socket.emit('add player', { id: id, name: player_name });
});