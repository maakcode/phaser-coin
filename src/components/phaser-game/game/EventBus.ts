import { Events } from "phaser";

export const EventKey = {
  Ready: "game-ready",
  Start: "game-start",
  End: "game-end",
} as const;

export const EventBus = new Events.EventEmitter();
