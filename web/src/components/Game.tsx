import { useRef, useEffect } from "react";
import Phaser from "phaser";
import { useGameSounds } from "@freegamestore/games";
import { MenuScene, FireAndWaterScene } from "./FireAndWaterScene";

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sounds = useGameSounds();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // Pass sounds to Phaser scenes
    (window as any).__gameSounds = sounds;

    const timeout = setTimeout(() => {
      if (!containerRef.current) return;
      
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 960,
        height: 640,
        backgroundColor: "#0d1f35",
        scene: [MenuScene, FireAndWaterScene],
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onClick={() => {
        const canvas = containerRef.current?.querySelector("canvas");
        if (canvas) canvas.focus();
      }}
    />
  );
}