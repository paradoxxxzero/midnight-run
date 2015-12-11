let r = i => Math.random() * i <<0
let random_color = () => `hsla(${r(360)}, 100%, 75%, 1)`
let random_name = () => 'random'

class Player {
  constructor(name, color, position=0) {
    this.track = document.querySelector('.track')
    this.player = document.createElement('div')
    this.player.classList.add('player')
    this.runner = document.createElement('div')
    this.runner.classList.add('runner')
    this.runner.style['background-color'] = color
    this.player.appendChild(this.runner)
    this.track.appendChild(this.player)
    this.position = position
  }

  step() {
    this.position = Math.min(this.position + 1, 100)
    this.runner.style.left = this.position + '%'
  }
}



document.addEventListener('DOMContentLoaded', () => {
  // Animate lauch
  setTimeout(() => document.body.classList.add('third-dimension'), 100)

  // Init player
  var self = new Player(random_name(), random_color()),
      state = 'right'

  addEventListener('keydown', (e) => {
    if(e.keyCode == 37) { // left
      state = 'left'
    } else if(e.keyCode == 39) { // right
      if (state == 'left') {
        self.step(true)
      }
      state = 'right'
    } else {
      state = 'error'
    }
  })
})
