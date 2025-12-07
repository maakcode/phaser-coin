import { Scene } from "phaser";
import { AssetKey } from "../types";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const { width, height } = this.scale;

    this.add
      .rectangle(0.5 * width, 0.5 * height, 0.8 * width, 32)
      .setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(0.5 * width, 0.5 * height, 4, 28, 0xffffff);

    this.load.on("progress", (progress: number) => {
      bar.displayWidth = Math.max(4, 0.8 * width * progress - 4);
    });
  }

  preload() {
    this.load.setPath("assets");
    this.load.spritesheet(AssetKey.Image.plusCoin, "p_coin.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(AssetKey.Image.minusCoin, "m_coin.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image(AssetKey.Image.star, "star.png");
    this.load.audio(AssetKey.Sound.gainScore, "scores.wav");
    this.load.audio(AssetKey.Sound.loseScore, "lose_scores.wav");
  }

  create() {
    this.scene.transition({
      target: "MainMenu",
      duration: 500,
      moveBelow: true,
      onUpdate: (progress: number) => {
        this.cameras.main.setAlpha(1 - progress);
      },
    });
  }
}
