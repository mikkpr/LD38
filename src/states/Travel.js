import Phaser from 'phaser'

import Player from '../sprites/Player'
import Obstacle from '../sprites/Obstacle'

import Curve from '../plugins/Curve'

import { enableMusicForState } from '../utils.js'

export default class extends Phaser.State {
  create () {
    this.game.world.enableBody = true
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.curve = this.game.plugins.add(Curve, [50, 0, 0, 0, 50])

    ::enableMusicForState('bigbeat')

    this.map = this.game.add.tilemap('earth_travel')
    this.map.addTilesetImage('lofi_environment_4x', 'tiles')

    // Add both the background and ground layers. We won't be doing anything
    // with the GroundLayer though
    this.backgroundLayer = this.map.createLayer('backgroundlayer')
    this.backgroundLayer.resizeWorld()

    // Add the sprite to the game and enable arcade physics on it
    this.player = new Player(this.game, 100, this.game.world.centerY)
    this.world.add(this.player)

    this.obstacle = new Obstacle(this.game, this.player, 300, this.game.world.centerY)
    this.world.add(this.obstacle)

    // Make the camera follow the sprite
    this.game.camera.follow(this.player)

    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.scale.refresh()

    this.game.time.advancedTiming = true
  }

  update () {
    
  }

  render () {
    this.game.debug.text(this.time.fps, 10, 20, '#00ff00')
  }

  shutdown () {
    this.game.plugins.remove(this.curve)
  }
}
