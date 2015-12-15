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
    this.tracks = document.querySelector('.tracks')
    this.player = document.createElement('div')
    this.player.setAttribute('data-name', name)
    this.player.classList.add('player')
    this.runner = document.createElement('span')
    this.runner.classList.add('runner')
    this.runner.style['background-color'] = color
    this.runner.style['border-color'] = color
    this.player.appendChild(this.runner)
    this.tracks.appendChild(this.player)
    this.tracks.style.display = 'none'
    this.name = name
    setTimeout(() => this.tracks.style.display = 'flex', 10)

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
    this.runner.style['margin-top'] = this.position + 'vmin'
  }

  remove() {
    this.tracks.removeChild(this.player)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Animate lauch
  setTimeout(() => document.body.classList.add('third-dimension'), 100)
  var id = Math.random()
  var key_state = ''
  var ready_state = 'unready'
  var errors = 0
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
    } else if (game_state == 'started'){
      if(e.keyCode == 37) { // left
        if (key_state == 'right') {
          if (errors <= 0) {
            socket.emit('step')
          } else {
            errors --
          }
          key_state = 'left'
        } else {
          if (key_state != '') {
            errors ++
            key_state = 'error'
          } else {
            key_state = 'left'
          }
        }
        key_state = 'left'
      } else if(e.keyCode == 39) { // right
        if (key_state == 'left') {
          if (errors <= 0) {
            socket.emit('step')
          } else {
            errors --
          }
          key_state = 'right'
        } else {
          if (key_state != '') {
            errors ++
            key_state = 'error'
          } else {
            key_state = 'right'
          }
        }
      }
    }
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
  })
  // Init player
  socket.on('new player', player => players[player.id] = new Player(player.name, player.color))
  socket.on('del player', id => {
    players[id].remove()
    delete players[id]
  })
  socket.on('state', (state) => game_state = state)
  socket.on('echo', (message) => document.querySelector('.echo').innerHTML = message)
  socket.on('position', ({id, position}) => players[id].move(position))
  socket.on('disconnect', () => setTimeout(() => location.reload(true), 500))
  socket.on('ready', id => players[id].ready())
  socket.on('unready', id => players[id].unready())
  socket.emit('add player', {id, name: player_name})
})
