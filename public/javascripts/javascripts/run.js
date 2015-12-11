'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var r = function r(i) {
  return Math.random() * i << 0;
};
var random_color = function random_color() {
  return 'hsla(' + r(360) + ', 100%, 75%, 1)';
};
var random_name = function random_name() {
  return 'random';
};

var Player = (function () {
  function Player(name, color) {
    var position = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    _classCallCheck(this, Player);

    this.track = document.querySelector('.track');
    this.player = document.createElement('div');
    this.player.classList.add('player');
    this.runner = document.createElement('div');
    this.runner.classList.add('runner');
    this.runner.style['background-color'] = color;
    this.player.appendChild(this.runner);
    this.track.appendChild(this.player);
    this.position = position;
  }

  _createClass(Player, [{
    key: 'step',
    value: function step() {
      this.position = Math.min(this.position + 1, 100);
      this.runner.style.left = this.position + '%';
    }
  }]);

  return Player;
})();

document.addEventListener('DOMContentLoaded', function () {
  // Animate lauch
  setTimeout(function () {
    return document.body.classList.add('third-dimension');
  }, 100);

  // Init player
  var self = new Player(random_name(), random_color()),
      state = 'right';

  addEventListener('keydown', function (e) {
    if (e.keyCode == 37) {
      // left
      state = 'left';
    } else if (e.keyCode == 39) {
      // right
      if (state == 'left') {
        self.step(true);
      }
      state = 'right';
    } else {
      state = 'error';
    }
  });
});