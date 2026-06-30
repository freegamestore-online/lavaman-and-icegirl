// Game.tsx — portrait 9:16 canvas, proper scaling with GameShell
import { useRef, useEffect, useState } from "react";
import Phaser from "phaser";
import { useGameSounds } from "@freegamestore/games";
import { FireAndWaterScene } from "./scenes/FireAndWaterScene";
import { MenuScene } from "./scenes/MenuScene";
import { MobileControls } from "./MobileControls";
import { setScaleFactor } from "./levels";

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sounds = useGameSounds();

  const [isMobile, setIsMobile] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<"fire" | "water">("fire");
  const [controls, setControls] = useState({ left: false, right: false, jump: false });
  const [isGameActive, setIsGameActive] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Send mobile controls to scene
  useEffect(() => {
    const scene = gameRef.current?.scene.getScene("FireAndWaterScene") as FireAndWaterScene;
    if (scene) (scene as any).setMobileControls?.(controls, activeCharacter);
  }, [controls, activeCharacter]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up existing game
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    (window as any).__gameSounds = sounds;

    const initGame = () => {
      const rect = container.getBoundingClientRect();
      let containerWidth = rect.width || 360;
      let containerHeight = rect.height || 640;

      // Fixed portrait dimensions (9:16)
      const BASE_WIDTH = 360;
      const BASE_HEIGHT = 640;

      let gameWidth, gameHeight;

      if (isMobile) {
        // On mobile: fill as much as possible with controls at bottom
        const maxWidth = containerWidth * 0.95;
        const maxHeight = containerHeight * 0.95;
        const scaleToFitWidth = maxWidth / BASE_WIDTH;
        const scaleToFitHeight = maxHeight / BASE_HEIGHT;
        const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight);
        gameWidth = Math.floor(BASE_WIDTH * bestScale);
        gameHeight = Math.floor(BASE_HEIGHT * bestScale);
        gameWidth = Math.max(gameWidth, 320);
        gameHeight = Math.max(gameHeight, 560);
      } else {
        // On desktop: square container sized to fit viewport
        const squareSize = Math.min(window.innerWidth, window.innerHeight);
        gameWidth = Math.floor(squareSize);
        gameHeight = Math.floor(squareSize);
      }

      console.log("Game dimensions:", { gameWidth, gameHeight, containerWidth, containerHeight, isMobile });

      // Set the scale factor for level resolution
      setScaleFactor(gameWidth, gameHeight);

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: container,
        width: gameWidth,
        height: gameHeight,
        scale: {
          mode: Phaser.Scale.NONE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: gameWidth,
          height: gameHeight,
        },
        antialias: true,
        render: { 
          pixelArt: false, 
          antialias: true,
        },
        dom: { createContainer: true },
        scene: [MenuScene, FireAndWaterScene],
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        backgroundColor: 0x0d1f35,
      };

      try {
        gameRef.current = new Phaser.Game(config);
        console.log("Game created successfully!");

        const game = gameRef.current;
        game.events.on("game-active", (active: boolean) => setIsGameActive(active));
        game.events.on("sceneactivate", (scene: Phaser.Scene) => {
          console.log("Scene activated:", scene.scene.key);
          if (scene.scene.key === "FireAndWaterScene") setIsGameActive(true);
          if (scene.scene.key === "MenuScene") setIsGameActive(false);
        });

        // Handle resize
        const handleResize = () => {
          const newRect = container.getBoundingClientRect();
          if (newRect.width === 0 || newRect.height === 0) return;
          
          let newWidth, newHeight;
          
          if (isMobile) {
            const maxWidth = newRect.width * 0.95;
            const maxHeight = newRect.height * 0.95;
            const scaleToFitWidth = maxWidth / BASE_WIDTH;
            const scaleToFitHeight = maxHeight / BASE_HEIGHT;
            const bestScale = Math.min(scaleToFitWidth, scaleToFitHeight);
            newWidth = Math.floor(BASE_WIDTH * bestScale);
            newHeight = Math.floor(BASE_HEIGHT * bestScale);
            newWidth = Math.max(newWidth, 320);
            newHeight = Math.max(newHeight, 560);
          } else {
            const squareSize = Math.min(window.innerWidth, window.innerHeight);
            newWidth = Math.floor(squareSize);
            newHeight = Math.floor(squareSize);
          }
          
          if (newWidth > 0 && newHeight > 0) {
            setScaleFactor(newWidth, newHeight);
            game.scale.resize(newWidth, newHeight);
          }
        };

        window.addEventListener("resize", handleResize);
        (game as any).__resizeHandler = handleResize;

      } catch (error) {
        console.error("Failed to initialize game:", error);
      }
    };

    const timeout = setTimeout(initGame, 100);

    return () => {
      clearTimeout(timeout);
      if (gameRef.current) {
        const game = gameRef.current;
        if ((game as any).__resizeHandler) {
          window.removeEventListener("resize", (game as any).__resizeHandler);
        }
        game.events.off("game-active");
        game.events.off("sceneactivate");
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isMobile]);

  const toggleCharacter = () =>
    setActiveCharacter((p) => (p === "fire" ? "water" : "fire"));

  // Game.tsx - update the return statement
  return (
    <div className={`relative w-full h-full ${isMobile ? 'flex flex-col' : 'flex items-center justify-center'} bg-[#050d18]`}>
      <div
        ref={containerRef}
        className={`bg-[#0d1f35] overflow-hidden ${isMobile ? 'w-full' : 'game-container-desktop'}`}
        style={{
          aspectRatio: isMobile ? "9/16" : "1/1",
          height: isMobile ? "auto" : "min(100vw, 100vh)",
          width: isMobile ? "100%" : "min(100vw, 100vh)",
          maxHeight: isMobile ? "calc(100vh - 160px)" : "100vh",
          maxWidth: isMobile ? "100%" : "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: isMobile ? "0" : "0 auto",
        }}
      />

      {isMobile && isGameActive && (
        <div className="flex-shrink-0 w-full h-[160px] bg-[#0a1828] border-t border-[#1a3a5c]">
          <MobileControls
            onControl={setControls}
            onToggleCharacter={toggleCharacter}
            activeCharacter={activeCharacter}
          />
        </div>
      )}
    </div>
  );
}