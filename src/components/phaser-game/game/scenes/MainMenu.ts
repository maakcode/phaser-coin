import { EventBus, EventKey } from "../EventBus";
import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(0.5 * width, 0.3 * height, "Phaser Coin", {
        fontFamily: "Arial Black",
        fontSize: 150,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 12,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(100);

    this.add
      .text(0.5 * width, 0.7 * height, "Click to start", {
        fontFamily: "Arial Black",
        fontSize: 96,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 10,
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(100);

    this.input.once(
      "pointerdown",
      () => {
        this.changeScene();
      },
      this
    );

    EventBus.emit(EventKey.Ready);
  }

  changeScene() {
    this.scene.start("Game");
  }
}
