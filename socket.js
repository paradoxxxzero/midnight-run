var socket = {}
var players = {}
var r = function r(i) {
  return Math.random() * i << 0
}
var random_color = () => 'hsla(' + r(360) + ', 100%, 75%, 1)'

socket.connection = s => {
  var sockets = socket.io.sockets
  s.on('error', console.error.bind(console))

  console.log('Got connection')
  s.on('add player', id_name => {
    var id = id_name.id,
    name = id_name.name
    console.log('Got player', id, name)
    // if (name in players) {
    //   throw new Error(name + ' already exists')
    // }
    /* Sending all previous player */
    for (var pid in players) {
      console.log('Adding player ', pid, ' for ', name)
      var player = players[pid]

      s.emit('new player', player)
    }

    players[id] = {id, name, color: random_color(), position: 0, ready: false}
    console.log('done')
    sockets.emit('new player', players[id])

    s.on('step', () => {
      players[id].position += .5
      sockets.emit('position', {id, position: players[id].position})
      if (players[id].position >= 100) {
        sockets.emit('state', 'end')
        sockets.emit('echo', name + ' has won')
        setTimeout(() => sockets.emit('disconnect'), 2000)
      }
    })
    s.on('ready', () => {
      players[id].ready = true
      sockets.emit('ready', id)
      console.log(id, name, 'is ready')
      var everyone_ready = true
      for (var pid in players) {
        if (!players[pid].ready) {
          everyone_ready = false
          break
        }
      }
      if (everyone_ready) {
        console.log('everyone is ready')
        sockets.emit('state', 'starting')
        sockets.emit('echo', '3')
        setTimeout(() => {
          sockets.emit('echo', '2')
          setTimeout(() => {
            sockets.emit('echo', '1')
            setTimeout(() => {
              sockets.emit('echo', 'Start')
              setTimeout(() => {
                sockets.emit('echo', '')
                sockets.emit('state', 'started')
              }, 1000)
            }, 1000)
          }, 1000)
        }, 1000)
      }
    })
    s.on('unready', () => {
      players[id].ready = false
      sockets.emit('unready', id)
      console.log(id, name, 'is not ready anymore')
    })

    s.on('disconnect', () => {
      console.log('Got disconnect for ', id, name)
      delete players[id]
      sockets.emit('del player', id)
    })
  })
}

module.exports = socket;
