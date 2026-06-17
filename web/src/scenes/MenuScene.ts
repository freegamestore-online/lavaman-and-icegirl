import Phaser from "phaser";
import { levels } from "../levels";

// Get sounds from the global (set by Game.tsx)
const getSounds = () => (window as any).__gameSounds;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background - use smoother gradient instead of solid color
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1f35, 0x0d1f35, 0x1a3a6b, 0x1a3a6b, 1);
    bg.fillRect(0, 0, width, height);
    
    // Stars - make them glow
    const starG = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.6);
      const size = Math.random() > 0.7 ? 2 : 1;
      const alpha = 0.5 + Math.random() * 0.5;
      starG.fillStyle(0xffffff, alpha);
      starG.fillCircle(x, y, size);
    }

    // Title - smooth with shadow and better font
    this.add.text(cx, 60, "🔥 FIRE & WATER 💧", {
      fontSize: "38px",
      color: "#ffffff",
      fontStyle: "bold",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 10, fill: true },
      resolution: 2, // Higher resolution for text
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.add.text(cx, 100, "Get both players to their doors!", {
      fontSize: "16px",
      color: "#a0b8cc",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Controls legend - smoother
    const legendY = 148;
    const legendBg = this.add.graphics();
    legendBg.fillStyle(0x1a2a4a, 0.4);
    legendBg.fillRoundedRect(cx - 220, legendY - 25, 440, 40, 10);
    
    this.add.text(cx - 120, legendY, "🔥 WASD to move", { 
      fontSize: "14px", 
      color: "#ff8866",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    
    this.add.text(cx + 120, legendY, "💧 Arrow keys", { 
      fontSize: "14px", 
      color: "#66ccff",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Divider
    this.add.rectangle(cx, 172, 500, 2, 0x2d4a6b, 0.6);

    // Level select heading
    this.add.text(cx, 195, "SELECT LEVEL", {
      fontSize: "14px",
      color: "#6b8aaa",
      letterSpacing: 4,
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Level buttons - smoother with rounded corners and better styling
    levels.forEach((lvl, i) => {
      const btnY = 230 + i * 64;
      const isUnlocked = true;

      // Button background with rounded corners
      const bg = this.add.graphics();
      bg.fillStyle(0x112233, 1);
      bg.fillRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
      bg.lineStyle(1, 0x1e3a5c, 1);
      bg.strokeRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
      
      // Make it interactive
      const hitArea = new Phaser.Geom.Rectangle(cx - 220, btnY - 25, 440, 50);
      const interactiveBg = this.add.zone(cx, btnY, 440, 50)
        .setInteractive({ hitArea, useHandCursor: true });

      const label = this.add.text(cx - 190, btnY, `${i + 1}`, {
        fontSize: "22px",
        color: "#2563eb",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0, 0.5);

      const titleText = this.add.text(cx - 150, btnY - 8, lvl.title.replace(/^Level \d+: /, ""), {
        fontSize: "17px",
        color: isUnlocked ? "#e8f0f8" : "#445566",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0, 0.5);

      const gemText = this.add.text(cx - 150, btnY + 10, `${lvl.gems.length} gems`, {
        fontSize: "12px",
        color: "#ffee22",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0, 0.5);

      const pips = i + 1;
      for (let p = 0; p < pips; p++) {
        const col = pips <= 2 ? 0x22cc66 : pips <= 4 ? 0xfbbf24 : 0xef4444;
        this.add.circle(cx + 140 + p * 14, btnY, 5, col);
      }

      const arrow = this.add.text(cx + 190, btnY, "▶", {
        fontSize: "18px",
        color: "#2563eb",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5);

      // Hover effects
      interactiveBg.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(0x1a3a5c, 1);
        bg.fillRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
        bg.lineStyle(2, 0x2563eb, 1);
        bg.strokeRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
        arrow.setColor("#66aaff");
        label.setColor("#66aaff");
      });
      
      interactiveBg.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(0x112233, 1);
        bg.fillRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
        bg.lineStyle(1, 0x1e3a5c, 1);
        bg.strokeRoundedRect(cx - 220, btnY - 25, 440, 50, 12);
        arrow.setColor("#2563eb");
        label.setColor("#2563eb");
      });
      
      interactiveBg.on("pointerdown", () => {
        const sounds = getSounds();
        if (sounds) sounds.playMove();
        
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("FireAndWaterScene", { level: i });
        });
      });
    });

    // Store link
    this.add.text(cx, height - 20, "Built for freegamestore.online", {
      fontSize: "12px",
      color: "#4a7aaa",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}