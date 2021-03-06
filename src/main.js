import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import CreditsState from './states/Credits'
import SplashState from './states/Splash'
import TravelState from './states/Travel'
import FightState from './states/Fight'

import config from './config'

class Game extends Phaser.Game {
  constructor () {
    const docElement = document.documentElement
    const width = docElement.clientWidth > config.gameWidth ? config.gameWidth : docElement.clientWidth
    const height = docElement.clientHeight > config.gameHeight ? config.gameHeight : docElement.clientHeight

    super(width, height, Phaser.CANVAS, 'content', null, false, false)

    this.state.add('Boot', BootState, false)
    this.state.add('Credits', CreditsState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Travel', TravelState, false)
    this.state.add('Fight', FightState, false)

    this.levelIndex = 0
    this.levels = [
      ['Boot'],
      ['Splash'],
      ['Fight', 'moon_fight'],
      ['Travel', 'earth_travel'],
      ['Fight', 'earth_fight'],
      ['Travel', 'mars_travel'],
      ['Fight', 'mars_fight'],
      ['Credits', 'credits']
    ]

    this.nextState()

    this.deathCounter = 0

    this.levelTimes = {
      earth: { start: null, stop: null },
      mars: { start: null, stop: null }
    }
  }

  nextState () {
    const [ state, ...args ] = this.levels[Math.min(this.levels.length - 1, this.levelIndex++)]
    this.state.start(state, true, false, ...args)
  }

  say (text, completed, keep = false) {
    const style = {
      font: '25px Press Start 2P',
      fill: '#ffffff',
      wordWrap: true,
      wordWrapWidth: 700,
      align: 'center'
    }
    this.text = this.add.text(this.width / 2, 250, '', style)
    this.text.anchor.set(0.5)

    this.renderByLetter(text, () => {
      if (!keep) {
        this.text.destroy()
      }
      completed()
    })
  }

  renderByLetter (text, completed) {
    const split = text.split('')
    let current = ''

    for (let i = 0; i < split.length; i++) {
      current += split[i]

      this.renderLetter(current, i, (n) => {
        if (n === split.length - 1) {
          setTimeout(completed, 800)
        }
      })
    }
  }

  renderLetter (text, n, completed) {
    const textField = this.text
    const { textSound } = this.sound.repository
    setTimeout(() => {
      textField.setText(text)
      textSound.play()
      completed(n)
    }, 80 * n)
  }

  addTitle() {

    var style = {
      font: '35px Press Start 2P',
      fill: '#F5DEB3',
      backgroundColor: '#8B4513',
      alpha: 0
    }

    this.title = this.add.text(0, -100, ' COBRA CALIBER 2 ', style)
    this.title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
    this.title.strokeThickness = 5

    this.title.y = 50
    this.title.x = this.width / 2 - this.title.width / 2

    style = {
      font: '15px Press Start 2P',
      fill: '#F5DEB3',
      backgroundColor: '#8B4513'
    }

    this.subtitle = this.add.text(0, -100, ' THERE CAN ONLY BE ONE MORE ', style)
    this.subtitle.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
    this.subtitle.strokeThickness = 5

    this.subtitle.y = this.title.y + 90
    this.subtitle.x = this.width / 2 - this.subtitle.width / 2
  }

}

window.game = new Game()





