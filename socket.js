var socket = {}
var players = {}
var r = function r(i) {
  return Math.random() * i << 0
}
var random_color = () => 'hsla(' + r(360) + ', 100%, 75%, 1)'

socket.connection = s => {
  var sockets = socket.io.sockets

  console.log('Got connection')
  s.on('add player', name => {
    console.log('Got player', name)
    /* Sending all previous player */
    for (var player_name in players) {
      console.log('Adding player ', player_name, ' for ', name)
      var player = players[player_name]

      s.emit('new player', {name: player_name, color: player.color})
    }

    players[name] = {socket: s, color: random_color(), position: 0, ready: false}
    sockets.emit('new player', {name, color: players[name].color})

    s.on('step', () => {
      players[name].position ++
      sockets.emit('position', {name, position: players[name].position})
      if (players[name].position >= 100) {
        sockets.emit('win', name)
      }
    })
    s.on('ready', () => {
      players[name].ready = true
      sockets.emit('ready', name)
      console.log(name, 'is ready')

      if (Object.keys(players).length > 1) {
        var everyone_ready = true
        for (var player of players) {
          if (!player.ready) {
             everyone_ready = false
             break
          }
        }
        if (everyone_ready) {
          console.log('everyone is ready')
          sockets.emit('start')
        }
      }
    })
    s.on('unready', () => {
      players[name].ready = false
      sockets.emit('unready', name)
      console.log(name, 'is not ready anymore')
    })

    s.on('disconnect', () => {
      console.log('Got disconnect for ', name)
      sockets.emit('del player', name)
    })

    s.on('error', console.log.bind(console))
  })
}

module.exports = socket;
