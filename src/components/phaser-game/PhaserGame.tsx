import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import StartGame from "./game/main";
import { EventBus, EventKey } from "./game/EventBus";

interface Props {
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

export default function PhaserGame({ className }: Props) {
  const game = useRef<Phaser.Game | null>(null);
  const [highScore, setHighScore] = useState(0);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame("game-container");
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        if (game.current !== null) {
          game.current = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    EventBus.on(EventKey.End, (score: number) => {
      setHighScore((currentScore) => Math.max(currentScore, score));
    });

    return () => {
      EventBus.removeListener(EventKey.End);
    };
  }, []);

  return (
    <div className="h-full py-8">
      <div className="flex justify-center pb-2 gap-2">
        <span>High Score: {highScore}</span>
      </div>
      <div id="game-container" className={className}></div>
    </div>
  );
}
