// MenuScene.ts — Properly centered for portrait mode
import Phaser from "phaser";
import { levelDefs } from "../levels";

const getSounds = () => (window as any).__gameSounds;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1f35, 0x0d1f35, 0x1a3a6b, 0x1a3a6b, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    const starG = this.add.graphics();
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.5);
      const sz = Math.random() > 0.7 ? 2 : 1;
      starG.fillStyle(0xffffff, 0.5 + Math.random() * 0.5);
      starG.fillCircle(x, y, sz);
    }

    // Title - positioned relative to screen height
    const titleY = height * 0.08;
    this.add.text(cx, titleY, "🔥 FIRE & WATER 💧", {
      fontSize: Math.min(height * 0.045, 32),
      color: "#ffffff",
      fontStyle: "bold",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 10, fill: true },
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.add.text(cx, titleY + height * 0.045, "Get both players to their doors!", {
      fontSize: Math.min(height * 0.02, 14),
      color: "#a0b8cc",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Controls legend
    const legendY = titleY + height * 0.1;
    const legendBg = this.add.graphics();
    legendBg.fillStyle(0x1a2a4a, 0.5);
    const legendWidth = Math.min(width * 0.7, 310);
    const legendHeight = Math.min(height * 0.08, 52);
    legendBg.fillRoundedRect(cx - legendWidth/2, legendY, legendWidth, legendHeight, 10);

    this.add.text(cx - legendWidth * 0.23, legendY + legendHeight * 0.35, "🔥 WASD", {
      fontSize: Math.min(height * 0.02, 13),
      color: "#ff8866",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.add.text(cx + legendWidth * 0.23, legendY + legendHeight * 0.35, "💧 Arrows", {
      fontSize: Math.min(height * 0.02, 13),
      color: "#66ccff",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.add.text(cx, legendY + legendHeight * 0.75, "R = Restart  •  ESC = Pause/Menu", {
      fontSize: Math.min(height * 0.017, 11),
      color: "#6b8aaa",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Divider
    const dividerY = legendY + legendHeight + height * 0.025;
    this.add.rectangle(cx, dividerY, Math.min(width * 0.6, 300), 1, 0x2d4a6b, 0.7);

    // Level select heading
    this.add.text(cx, dividerY + height * 0.025, "SELECT LEVEL", {
      fontSize: Math.min(height * 0.018, 12),
      color: "#6b8aaa",
      letterSpacing: 3,
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    // Level buttons - dynamically positioned
    const startY = dividerY + height * 0.06;
    const btnH = Math.min(height * 0.08, 58);
    const btnW = Math.min(width * 0.75, 500);
    const btnX = cx - btnW / 2;
    const spacing = Math.min(height * 0.09, 64);
    const maxLevels = Math.min(levelDefs.length, Math.floor((height - startY - 40) / spacing));

    // Calculate visible levels (show all if they fit, otherwise show max)
    const visibleLevels = levelDefs.slice(0, maxLevels);

    visibleLevels.forEach((lvl, i) => {
      const btnY = startY + i * spacing;
      const midY = btnY + btnH / 2;

      // Button background
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x112233, 1);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
      btnBg.lineStyle(1, 0x1e3a5c, 1);
      btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 10);

      // Interactive zone
      const zone = this.add.zone(cx, midY, btnW, btnH)
        .setInteractive({ useHandCursor: true });

      // Level number badge
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0x1e3a5c, 1);
      const badgeRadius = Math.min(btnH * 0.3, 16);
      badgeBg.fillCircle(btnX + badgeRadius + 10, midY, badgeRadius);
      this.add.text(btnX + badgeRadius + 10, midY, `${i + 1}`, {
        fontSize: Math.min(btnH * 0.3, 16),
        color: "#60a5fa",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5);

      // Level name
      const name = lvl.title.replace(/^Level \d+:\s*/, "");
      const nameSize = Math.min(btnH * 0.26, 14);
      this.add.text(btnX + badgeRadius * 2 + 20, midY - btnH * 0.15, name, {
        fontSize: nameSize,
        color: "#e8f0f8",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0, 0.5);

      // Gem count
      this.add.text(btnX + badgeRadius * 2 + 20, midY + btnH * 0.2, `${lvl.gems.length} gems`, {
        fontSize: Math.min(btnH * 0.19, 10),
        color: "#ffee22",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0, 0.5);

      // Difficulty pips
      const pips = Math.min(i + 1, 3);
      const pipColor = pips <= 2 ? 0x22cc66 : 0xfbbf24;
      const pipSize = Math.min(btnH * 0.07, 3.5);
      for (let p = 0; p < pips; p++) {
        this.add.circle(btnX + btnW - 44 + p * 10, midY, pipSize, pipColor);
      }

      // Arrow
      const arrow = this.add.text(btnX + btnW - 18, midY, "▶", {
        fontSize: Math.min(btnH * 0.25, 13),
        color: "#2563eb",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5);

      // Hover effects
      zone.on("pointerover", () => {
        btnBg.clear();
        btnBg.fillStyle(0x1a3a5c, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
        btnBg.lineStyle(2, 0x2563eb, 1);
        btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 10);
        arrow.setColor("#60a5fa");
      });
      zone.on("pointerout", () => {
        btnBg.clear();
        btnBg.fillStyle(0x112233, 1);
        btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 10);
        btnBg.lineStyle(1, 0x1e3a5c, 1);
        btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 10);
        arrow.setColor("#2563eb");
      });
      zone.on("pointerdown", () => {
        const sounds = getSounds();
        if (sounds) sounds.playMove();
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("FireAndWaterScene", { level: i });
        });
      });
    });

    // Footer
    this.add.text(cx, height - 12, "freegamestore.online", {
      fontSize: Math.min(height * 0.016, 10),
      color: "#4a7aaa",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);

    this.game.events.emit("game-active", false);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}