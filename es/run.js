var socket = io(),
    players = {},
    game_state = 'not started'

var player_name = 'Unnamed'
if (!localStorage.getItem('midnigth_name')) {
  player_name = localStorage.midnigth_name = prompt('Enter your name')
} else {
  player_name = localStorage.getItem('midnigth_name')
}

class Player {
  constructor(name, color, position=0) {
    this.track = document.querySelector('.track')
    this.player = document.createElement('div')
    this.player.setAttribute('data-name', name)
    this.player.classList.add('player')
    this.runner = document.createElement('div')
    this.runner.classList.add('runner')
    this.runner.style['background-color'] = color
    this.runner.style['border-color'] = color
    this.player.appendChild(this.runner)
    this.track.appendChild(this.player)
    this.position = position
  }
  ready() {
    this.player.classList.add('ready')
  }
  unready() {
    this.player.classList.remove('ready')
  }

  move(position) {
    this.position = Math.min(position, 100)
    this.runner.style.left = this.position + '%'
  }

  remove() {
    this.track.removeChild(this.player)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Animate lauch
  setTimeout(() => document.body.classList.add('third-dimension'), 100)

  var key_state = 'right'
  var ready_state = 'unready'
  addEventListener('keydown', (e) => {
    if (game_state == 'not started') {
      if (ready_state == 'ready') {
        return
      }
      if(e.keyCode == 37) { // left
        if (ready_state == 'right') {
          socket.emit('ready')
          ready_state = 'ready'
        } else {
          ready_state = 'left'
        }
      } else if(e.keyCode == 39) { // right
        if (ready_state == 'left') {
          ready_state = 'ready'
          socket.emit('ready')
        } else {
          ready_state = 'right'
        }
      }
    } else {
      if(e.keyCode == 37) { // left
        key_state = 'left'
      } else if(e.keyCode == 39) { // right
        if (key_state == 'left') {
          socket.emit('step')
        }
        key_state = 'right'
      } else {
        key_state = 'error'
      }
    }
    console.log(ready_state)
  })
  addEventListener('keyup', (e) => {
    if (game_state == 'not started') {
      if (ready_state == 'ready') {
        if(e.keyCode == 37) { // left
          ready_state = 'right'
          socket.emit('unready')
        } else if(e.keyCode == 39) { // right
          ready_state = 'left'
          socket.emit('unready')
        }
      }
      if(ready_state == 'left' && e.keyCode == 37) { // left
        ready_state = 'unready'
      } else if(ready_state == 'right' && e.keyCode == 39) { // right
        ready_state = 'unready'
      }
    }
    console.log(ready_state)
  })
  // Init player
  socket.on('new player', player => players[player.name] = new Player(player.name, player.color))
  socket.on('del player', name => {
    players[name].remove()
    delete players[name]
  })
  socket.on('start', () => game_state = 'start')
  socket.on('position', ({name, position}) => players[name].move(position))
  socket.on('win', (name) => alert(name + ' won'))
  socket.on('disconnect', () => setTimeout(() => location.reload(true), 500))
  socket.on('ready', name => players[name].ready())
  socket.on('unready', name => players[name].unready())
  socket.emit('add player', player_name)
})
