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
      this.runner.style.left = this.position + '%';
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

  var key_state = 'right';
  var ready_state = 'unready';
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
    } else {
      if (e.keyCode == 37) {
        // left
        key_state = 'left';
      } else if (e.keyCode == 39) {
        // right
        if (key_state == 'left') {
          socket.emit('step');
        }
        key_state = 'right';
      } else {
        key_state = 'error';
      }
    }
    console.log(ready_state);
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
    console.log(ready_state);
  });
  // Init player
  socket.on('new player', function (player) {
    return players[player.name] = new Player(player.name, player.color);
  });
  socket.on('del player', function (name) {
    players[name].remove();
    delete players[name];
  });
  socket.on('start', function () {
    return game_state = 'start';
  });
  socket.on('position', function (_ref) {
    var name = _ref.name;
    var position = _ref.position;
    return players[name].move(position);
  });
  socket.on('win', function (name) {
    return alert(name + ' won');
  });
  socket.on('disconnect', function () {
    return setTimeout(function () {
      return location.reload(true);
    }, 500);
  });
  socket.on('ready', function (name) {
    return players[name].ready();
  });
  socket.on('unready', function (name) {
    return players[name].unready();
  });
  socket.emit('add player', player_name);
});