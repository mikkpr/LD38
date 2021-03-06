import Phaser from 'phaser'

export default class extends Phaser.Plugin {
  init () {
    this.hasPostRender = true

    this.setPoints([0])

    // Preallocate ImageData buffer.
    this.post = new ImageData(this.game.width, this.game.height)
  }

  setPoints (points) {
    this.game.input.keyboard.addKey(Phaser.Keyboard.C).onDown.add(this.toggle, this)

    // Precompute curve shift amounts for each pixel column.
    this.curveOff = new Uint32Array(this.game.width * this.game.height * 4)
    for (let col = 0; col < this.game.width; col++) {
      const bez = this.game.math.bezierInterpolation(points, col / this.game.width)
      const off = Math.floor(bez) * this.game.width * 4
      for (let row = 0; row < this.game.height; row++) {
        const start = row * this.game.width * 4 + col * 4
        this.curveOff[start] = off
        this.curveOff[start + 1] = off
        this.curveOff[start + 2] = off
        this.curveOff[start + 3] = off
      }
    }
  }

  toggle () {
    this.hasPostRender = !this.hasPostRender
  }

  postRender () {
    // Copy ImageData, shifting each column of pixels down by the curve offset.
    const pre = this.game.context.getImageData(0, 0, this.game.width, this.game.height)
    for (let i = 0; i < pre.data.length; i++) {
      this.post.data[i + this.curveOff[i]] = pre.data[i]
    }
    this.game.context.putImageData(this.post, 0, 0)
  }
}
