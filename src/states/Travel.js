import Phaser from 'phaser'

import Player from '../sprites/Player'
import Turret from '../sprites/Turret'

import { enableMusicForState } from '../utils.js'

export default class extends Phaser.State {
  init (tilemap) {
    this.tilemap = tilemap
  }

  create () {
    this.disableMusic = enableMusicForState('bigbeat', this)

    this.game.world.enableBody = true
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.curve.setPoints([50, 0, 0, 0, 50])

    this.map = this.game.add.tilemap(this.tilemap)
    switch (this.tilemap) {
      case 'earth_travel':
        this.map.addTilesetImage('lofi_environment_4x', 'tiles_lofi_environment')
        this.map.addTilesetImage('lofi_scifi_stations_4x', 'tiles_lofi_stations')
        this.map.addTilesetImage('lofi_scifi_stations_2_4x', 'tiles_lofi_stations_2')
        this.map.addTilesetImage('lofi_scifi_stations_3_4x', 'tiles_lofi_stations_3')
        this.map.addTilesetImage('lofi_scifi_items_4x', 'tiles_lofi_items')
        this.map.addTilesetImage('lofi_interface_4x', 'tiles_interface')
        // fallthrough
      case 'mars_travel':
        this.map.addTilesetImage('lofi_scifi_ships_2_4x', 'tiles_ships_2')
        break
    }

    // Add both the background and ground layers.
    this.map.createLayer('backgroundlayer').resizeWorld()

    this.bg1 = this.game.add.tileSprite(0,
      0,
      this.game.world.width,
      this.game.world.height,
      'bg1'
    )

    this.groundLayer = this.map.createLayer('groundlayer')
    this.map.setCollisionBetween(1, 1000, true, 'groundlayer')

    // Add the sprite to the game and enable arcade physics on it
    this.player = new Player(this.game, 100, 256)
    this.world.add(this.player)

    // Player physics in this state.
    this.maxVelocity = 800 // Default max velocity, can be overridden by dashing.
    this.player.body.maxVelocity.x = this.maxVelocityX
    this.player.body.gravity.x = 1800

    this.player.body.collideWorldBounds = true
    this.player.body.onWorldBounds = new Phaser.Signal()
    this.player.body.onWorldBounds.add(this.hitWorldBounds, this)


    // Add turrets.
    this.turretGroup = this.game.add.group()
    switch (this.tilemap) {
      case 'earth_travel':
        const turretSheet = 'scifi_monsters_large'
        const bulletSheet = 'environment_sprites'
        new Array( // Use new Array instead of [] so webpack does not get confused.
          [ 600, 100, 18, 164, {target: this.player, bullets: 5, rate: 300, cone: 0}],
          [ 7600, 100, 18, 164, {bullets: 10, rate: 50, speed: 250}],
          [ 9600, 100, 18, 164, {target: this.player, bullets: 10, rate: 50, speed: 400, cone: 0}],
          [10560, 300, 18, 164, {target: this.player, bullets: 10, rate: 50, speed: 400, cone: 0}],
          [11200, 200, 18, 164, {target: this.player, bullets: 10, rate: 50}],
          [11900, 366, 18, 164],
          [11900, 32, 18, 164],
          [14720, 100, 18, 164],
          [20672, 270, 18, 164, {target: this.player, bullets: 12, rate: 40, homing: true}]
        ).forEach(([x, y, turretFrame, bulletFrame, options]) => {
          this.turretGroup.add(new Turret(this.game, x, y,
            turretSheet, turretFrame, bulletSheet, bulletFrame, options))
        })
    }

    // Make the camera follow the sprite
    // FIXME: replaced with ugly hack to only travel on x-axis for the presenatation.
    // this.game.camera.follow(this.player)
    this.game.camera.setPosition(0, 0)

    this.game.scale.pageAlignHorizontally = true
    this.game.scale.pageAlignVertically = true
    this.game.scale.refresh()

    this.game.time.advancedTiming = true
  }

  render () {
    this.game.debug.text(this.time.fps, 10, 20, '#00ff00')
    this.game.debug.text(`Alternate dimensions where you could have died: ${this.game.deathCounter}`, 500, 20, '#00ff00')
  }

  update () {
    this.bg1.tilePosition.x -= this.player.body.velocity.x / 1500.0

    this.game.camera.x = this.player.x - this.game.width / 3 // Possibly go to quarter distance when turrets are fixed

    // Player collides with ground and turrets.
    this.game.physics.arcade.collide(this.player, this.groundLayer, this.player.resetWithAnimation, null, this.player)
    this.game.physics.arcade.collide(this.player, this.turretGroup, this.player.resetWithAnimation, null, this.player)

    // Bullets collide with player, ground, and turrets.
    this.turretGroup.forEach((turret) => {
      turret.weapon.forEach((bullet) => {
        // Fuck it, we are running out of time.
        const kill = this.game.physics.arcade.collide(bullet, this.player, this.player.resetWithAnimation, null, this.player)
        if (kill) {
          bullet.kill()
          if (turret.target === this.player) {
            turret.deaggro()
          }
        }
        this.game.physics.arcade.collide(bullet, this.groundLayer, bullet.kill, null, bullet)
        this.game.physics.arcade.collide(bullet, this.turretGroup, bullet.kill, null, bullet)
      })
    })

    // Vertical movement is instant.
    const accY = 350
    if (this.player.isMovingUp()) {
      this.player.body.velocity.y = -accY
    } else if (this.player.isMovingDown()) {
      this.player.body.velocity.y = accY
    } else {
      this.player.body.velocity.y = 0 // Vertical movement has to be precise
    }

    // Horizontal dashing is almost instant, braking takes time.
    const accX = 360
    if (this.player.isMovingRight()) {
      this.player.body.maxVelocity.x = this.maxVelocity + accX
      this.player.body.velocity.x += accX
    } else if (this.player.isMovingLeft()) {
      this.player.body.maxVelocity.x = this.maxVelocity - accX
      this.player.body.velocity.x -= accX / 6
    } else {
      this.player.body.maxVelocity.x = this.maxVelocity
    }
  }

  shutdown () {
    this.disableMusic()
  }

  hitWorldBounds (sprite, up, down, left, right) {
    if (sprite === this.player && right === true) {
      this.game.nextState()
    }
  }
}
