import { EventBus, EventKey } from "../EventBus";
import { Scene } from "phaser";
import { AssetKey, RegistryKey } from "../types";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    const { width, height } = this.scale;
    const score = this.registry.get(RegistryKey.score);

    this.add
      .text(0.5 * width, 0.5 * height, `Game Over\n\Score: ${score}`, {
        fontFamily: AssetKey.Font.titanOne,
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setAlign("center")
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    EventBus.emit(EventKey.End, score);
  }
}
