import { Scene } from "phaser";
import { EventBus, EventKey } from "../EventBus";
import { Coin } from "../nodes/Coin";
import { AssetKey, RegistryKey } from "../types";

const TOTAL_COINS = 13;
const GOLDEN_COINS = 5;

export class Game extends Scene {
  score: number = 0;
  coinGroups!: Phaser.Physics.Arcade.Group;
  plusStarEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  minusStarEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  scoreText!: Phaser.GameObjects.Text;
  scoreTween?: Phaser.Tweens.Tween;
  timer!: Phaser.Time.TimerEvent;
  progressBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;
    this.registry.set(RegistryKey.score, 0);
    this.score = 0;

    this.anims.create({
      key: AssetKey.Animation.plusCoinFlip,
      frames: this.anims.generateFrameNumbers(AssetKey.Image.plusCoin, {
        start: 0,
        end: 5,
      }),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKey.Animation.minusCoinFlip,
      frames: this.anims.generateFrameNumbers(AssetKey.Image.minusCoin, {
        start: 0,
        end: 5,
      }),
      frameRate: 16,
      repeat: -1,
    });

    this.plusStarEmitter = this.add.particles(0, 0, AssetKey.Image.star, {
      lifespan: 500,
      speed: { min: 400, max: 650 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });

    this.minusStarEmitter = this.add.particles(0, 0, AssetKey.Image.star, {
      lifespan: 500,
      speed: { min: 400, max: 650 },
      alpha: { start: 1, end: 0 },
      tint: 0xff0000,
      emitting: false,
    });

    this.scoreText = this.add
      .text(0.5 * width, 0.15 * height, "0", {
        fontFamily: AssetKey.Font.titanOne,
        fontSize: 256,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 12,
        align: "center",
      })
      .setOrigin(0.5)
      .setScale(0.5)
      .setDepth(1);

    this.progressBar = this.add
      .rectangle(0, height, width, height, 0x1e293b)
      .setOrigin(0, 0)
      .setDepth(-1);

    this.timer = this.time.addEvent({
      delay: 8_600,
      callback: () => this.gameOver(),
    });

    this.physics.world.setBounds(0, -400, width, height + 400);

    this.coinGroups = this.physics.add.group({
      defaultKey: "coins",
      collideWorldBounds: true,
    });

    for (let i = 0; i < TOTAL_COINS; i++) {
      this.dropCoin(i < GOLDEN_COINS);
    }

    this.input.on(
      "gameobjectdown",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (gameObject instanceof Coin) {
          this.clickCoin(gameObject);
        }
      }
    );

    EventBus.emit(EventKey.Start);
  }

  dropCoin(isPlus: boolean) {
    const { width } = this.scale;
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(-100, -300);

    const coin = new Coin(this, x, y, isPlus);
    this.coinGroups.add(coin);

    coin.setVelocityX(Phaser.Math.Between(-600, 600));
    coin.setVelocityY(Phaser.Math.Between(-400, 100));
    coin.setCollideWorldBounds(true);
    coin.setBounce(1, Phaser.Math.FloatBetween(0.8, 0.9));
    coin.setInteractive();
  }

  clickCoin(coin: Coin) {
    if (coin.isPlus) {
      this.plusStarEmitter.emitParticle(8, coin.x, coin.y);
      this.sound.play(AssetKey.Sound.gainScore);
    } else {
      this.minusStarEmitter.emitParticle(8, coin.x, coin.y);
      this.sound.play(AssetKey.Sound.loseScore);
    }

    this.scoreTween?.seek(0);
    this.scoreTween?.remove();
    this.scoreTween = this.tweens.add({
      targets: this.scoreText,
      y: { value: coin.isPlus ? "-=30" : "+=30" },
      scale: coin.isPlus ? 0.8 : 0.3,
      ease: "sine.inout",
      duration: 100,
      yoyo: true,
    });

    const blastRadius = 150;
    const blastSpeed = 900;
    const direction = coin.isPlus ? 1 : -1;

    const bodies = this.physics.overlapCirc(
      coin.x,
      coin.y,
      blastRadius,
      true,
      true
    );

    bodies.forEach((body) => {
      const child = body.gameObject;
      if (child === coin || !(child instanceof Coin)) return;

      const angle = Phaser.Math.Angle.Between(coin.x, coin.y, child.x, child.y);
      child.setVelocity(
        Math.cos(angle) * blastSpeed * direction,
        Math.sin(angle) * blastSpeed * direction
      );
    });

    coin.disableInteractive();
    coin.setVelocity(0, 0);
    this.coinGroups.remove(coin, true, true);
    this.score = Math.max(0, this.score + (coin.isPlus ? 1 : -1));
    this.scoreText.setText(`${this.score}`);

    const coins = this.coinGroups
      .getChildren()
      .filter((item) => item instanceof Coin);

    const numberOfGoldenCoins = coins.filter((coin) => coin.isPlus).length;

    coins.length;

    const isPlus = this.score + numberOfGoldenCoins < 10;

    this.dropCoin(isPlus);
  }

  update() {
    const { height } = this.scale;
    this.progressBar.y = height * (1 - this.timer.getProgress());
  }

  gameOver() {
    this.coinGroups.getChildren().forEach((coin) => {
      if (!(coin instanceof Coin)) return;

      if (coin.isPlus) {
        this.plusStarEmitter.emitParticle(8, coin.x, coin.y);
      } else {
        this.minusStarEmitter.emitParticle(8, coin.x, coin.y);
      }
    });
    this.coinGroups.clear(true, true);

    this.input.off("gameobjectdown");
    this.registry.set(RegistryKey.score, this.score);

    this.time.delayedCall(2000, () => this.scene.start("GameOver"));
  }
}
