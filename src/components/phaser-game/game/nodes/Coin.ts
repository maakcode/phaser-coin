import Phaser from "phaser";
import { AssetKey } from "../types";

export class Coin extends Phaser.Physics.Arcade.Sprite {
  isPlus: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, isPlus: boolean) {
    const image = isPlus ? AssetKey.Image.plusCoin : AssetKey.Image.minusCoin;
    super(scene, x, y, image);
    this.isPlus = isPlus;
    this.setScale(1.75);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play({
      key: isPlus
        ? AssetKey.Animation.plusCoinFlip
        : AssetKey.Animation.minusCoinFlip,
      frameRate: Phaser.Math.Between(12, 20),
      startFrame: Phaser.Math.Between(0, 5),
      repeat: -1,
    });
  }

  update(): void {
    if (this.x + this.width < this.scene.cameras.main.worldView.left) {
      this.destroy();
    }
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }
}
