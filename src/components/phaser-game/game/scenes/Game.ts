import { Scene } from "phaser";
import { EventBus, EventKey } from "../EventBus";
import { Coin } from "../nodes/Coin";
import { AssetKey, RegistryKey } from "../types";

export class Game extends Scene {
  score: number = 0;
  coinGroups!: Phaser.Physics.Arcade.Group;
  plusStarEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  minusStarEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  scoreText!: Phaser.GameObjects.Text;
  timeText!: Phaser.GameObjects.Text;
  timer!: Phaser.Time.TimerEvent;

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

    this.scoreText = this.add.text(32, 32, "Coins: 0").setDepth(1);
    this.timeText = this.add
      .text(1024 - 32, 32, "Time: 5")
      .setOrigin(1, 0)
      .setDepth(1);

    this.timer = this.time.addEvent({
      delay: 7_000,
      callback: () => this.gameOver(),
    });

    this.physics.world.setBounds(0, -400, width, height + 400);

    this.coinGroups = this.physics.add.group({
      defaultKey: "coins",
      collideWorldBounds: true,
    });

    for (let i = 0; i < 21; i++) {
      this.dropCoin(i < 7);
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

    coin.disableInteractive();
    coin.setVelocity(0, 0);
    this.coinGroups.remove(coin, true, true);
    this.score = Math.max(0, this.score + (coin.isPlus ? 1 : -1));
    this.scoreText.setText("Coins: " + this.score);

    const numberOfGoldenCoins = this.coinGroups
      .getChildren()
      .filter((item) => item instanceof Coin && item.isPlus).length;

    const isPlus = this.score + numberOfGoldenCoins < 10;

    this.dropCoin(isPlus);
  }

  update() {
    this.timeText.setText(
      "Time: " + Math.ceil(this.timer.getRemainingSeconds())
    );
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
