import Phaser from "phaser";
import { levels } from "../levels";

export class UIManager {
  private scene: Phaser.Scene;
  public statusText!: Phaser.GameObjects.Text;
  public fireIndicator!: Phaser.GameObjects.Text;
  public waterIndicator!: Phaser.GameObjects.Text;
  public gameOverPopup!: Phaser.GameObjects.Container;
  public pausePopup!: Phaser.GameObjects.Container;
  private currentLevel: number;
  private score: number;
  private onRestart: () => void;
  private onMenu: () => void;
  private onResume: () => void;
  private pauseButton!: Phaser.GameObjects.Container;
  private isPaused = false;

  constructor(
    scene: Phaser.Scene,
    currentLevel: number,
    score: number,
    onRestart: () => void,
    onMenu: () => void,
    onResume: () => void
  ) {
    this.scene = scene;
    this.currentLevel = currentLevel;
    this.score = score;
    this.onRestart = onRestart;
    this.onMenu = onMenu;
    this.onResume = onResume;
  }

  createUI() {
    const level = levels[this.currentLevel] ?? levels[0]!;

    this.scene.add
      .text(16, 12, level.title, {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 2, fill: true },
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.statusText = this.scene.add
      .text(16, 36, "WASD = 🔥  |  Arrows = 💧  |  R = Restart  |  ESC = Pause", {
        fontSize: "12px",
        color: "#a0b8cc",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.fireIndicator = this.scene.add
      .text(16, 600, "🔥 Moving", { 
        fontSize: "13px", 
        color: "#ff8866",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.waterIndicator = this.scene.add
      .text(200, 600, "💧 Moving", { 
        fontSize: "13px", 
        color: "#66ccff",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // Create pause button in top right corner
    this.createPauseButton();
  }

  private createPauseButton() {
    const { width } = this.scene.scale;
    const x = width - 30;
    const y = 30;

    // Container for button
    this.pauseButton = this.scene.add.container(x, y);
    this.pauseButton.setDepth(20);

    // Button background - circle with border
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.85);
    bg.fillCircle(0, 0, 22);
    bg.lineStyle(2, 0x3b82f6, 1);
    bg.strokeCircle(0, 0, 22);
    this.pauseButton.add(bg);

    // Pause icon (two vertical bars)
    const icon = this.scene.add.text(0, 0, "⏸", {
      fontSize: "20px",
      color: "#ffffff",
      resolution: 2,
    }).setOrigin(0.5);
    this.pauseButton.add(icon);

    // Make it interactive
    const hitArea = new Phaser.Geom.Circle(0, 0, 22);
    const hitZone = this.scene.add.zone(0, 0, 44, 44)
      .setInteractive({ hitArea, useHandCursor: true });
    this.pauseButton.add(hitZone);

    // Hover effects
    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x2a4a6a, 0.9);
      bg.fillCircle(0, 0, 22);
      bg.lineStyle(2, 0x60a5fa, 1);
      bg.strokeCircle(0, 0, 22);
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x1a2a3a, 0.85);
      bg.fillCircle(0, 0, 22);
      bg.lineStyle(2, 0x3b82f6, 1);
      bg.strokeCircle(0, 0, 22);
    });

    hitZone.on("pointerdown", () => {
      this.togglePause();
    });

    // Tooltip on hover
    const tooltip = this.scene.add.text(0, -35, "Pause", {
      fontSize: "10px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 6, y: 3 },
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    tooltip.setVisible(false);
    this.pauseButton.add(tooltip);

    hitZone.on("pointerover", () => {
      tooltip.setVisible(true);
    });
    hitZone.on("pointerout", () => {
      tooltip.setVisible(false);
    });
  }

  togglePause() {
    if (this.isPaused) {
      // Resume
      this.closePausePopup();
      this.isPaused = false;
      // Update button icon
      const icon = this.pauseButton.list[1] as Phaser.GameObjects.Text;
      if (icon) icon.setText("⏸");
    } else {
      // Pause
      this.showPausePopup();
      this.isPaused = true;
      // Update button icon
      const icon = this.pauseButton.list[1] as Phaser.GameObjects.Text;
      if (icon) icon.setText("▶");
    }
  }

  updateIndicators(fireAtGoal: boolean, waterAtGoal: boolean) {
    this.fireIndicator.setText(fireAtGoal ? "🔥 At goal! ✓" : "🔥 Moving");
    this.waterIndicator.setText(waterAtGoal ? "💧 At goal! ✓" : "💧 Moving");
  }

  showGameOverPopup() {
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.gameOverPopup = this.scene.add.container(cx, cy);
    this.gameOverPopup.setDepth(100);

    // Semi-transparent overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.75);
    overlay.setInteractive();
    this.gameOverPopup.add(overlay);

    // Popup background with rounded corners
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.95);
    bg.fillRoundedRect(-210, -110, 420, 220, 16);
    bg.lineStyle(3, 0xff4444, 1);
    bg.strokeRoundedRect(-210, -110, 420, 220, 16);
    this.gameOverPopup.add(bg);

    // Glow effect
    const glow = this.scene.add.graphics();
    glow.lineStyle(2, 0xff4444, 0.2);
    glow.strokeRoundedRect(-215, -115, 430, 230, 20);
    this.gameOverPopup.add(glow);

    // Title
    const title = this.scene.add.text(0, -60, "💀 GAME OVER", {
      fontSize: "34px",
      color: "#ff4444",
      fontStyle: "bold",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 8, fill: true },
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.gameOverPopup.add(title);

    // Subtitle
    const subtitle = this.scene.add.text(0, -20, "You touched the wrong element!", {
      fontSize: "16px",
      color: "#ffaa88",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.gameOverPopup.add(subtitle);

    // Restart button with rounded corners
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0x2563eb, 1);
    btnBg.fillRoundedRect(-100, 15, 200, 48, 12);
    btnBg.lineStyle(2, 0x3b82f6, 1);
    btnBg.strokeRoundedRect(-100, 15, 200, 48, 12);
    this.gameOverPopup.add(btnBg);

    const btnText = this.scene.add.text(0, 39, "🔄 Restart", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.gameOverPopup.add(btnText);

    // Make button interactive
    const hitArea = new Phaser.Geom.Rectangle(-100, 15, 200, 48);
    const interactiveBtn = this.scene.add.zone(0, 39, 200, 48)
      .setInteractive({ hitArea, useHandCursor: true });
    this.gameOverPopup.add(interactiveBtn);

    interactiveBtn.on("pointerover", () => {
      btnBg.clear();
      btnBg.fillStyle(0x3b82f6, 1);
      btnBg.fillRoundedRect(-100, 15, 200, 48, 12);
      btnBg.lineStyle(2, 0x60a5fa, 1);
      btnBg.strokeRoundedRect(-100, 15, 200, 48, 12);
    });
    interactiveBtn.on("pointerout", () => {
      btnBg.clear();
      btnBg.fillStyle(0x2563eb, 1);
      btnBg.fillRoundedRect(-100, 15, 200, 48, 12);
      btnBg.lineStyle(2, 0x3b82f6, 1);
      btnBg.strokeRoundedRect(-100, 15, 200, 48, 12);
    });
    interactiveBtn.on("pointerdown", this.onRestart);

    // Menu button
    const menuBtnBg = this.scene.add.graphics();
    menuBtnBg.fillStyle(0x4a5568, 1);
    menuBtnBg.fillRoundedRect(-100, 75, 200, 40, 12);
    menuBtnBg.lineStyle(2, 0x6b7a8c, 1);
    menuBtnBg.strokeRoundedRect(-100, 75, 200, 40, 12);
    this.gameOverPopup.add(menuBtnBg);

    const menuBtnText = this.scene.add.text(0, 95, "🏠 Main Menu", {
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.gameOverPopup.add(menuBtnText);

    const menuHit = new Phaser.Geom.Rectangle(-100, 75, 200, 40);
    const menuBtn = this.scene.add.zone(0, 95, 200, 40)
      .setInteractive({ hitArea: menuHit, useHandCursor: true });
    this.gameOverPopup.add(menuBtn);
    menuBtn.on("pointerdown", this.onMenu);
    menuBtn.on("pointerover", () => {
      menuBtnBg.clear();
      menuBtnBg.fillStyle(0x5a6a7a, 1);
      menuBtnBg.fillRoundedRect(-100, 75, 200, 40, 12);
      menuBtnBg.lineStyle(2, 0x7a8a9a, 1);
      menuBtnBg.strokeRoundedRect(-100, 75, 200, 40, 12);
    });
    menuBtn.on("pointerout", () => {
      menuBtnBg.clear();
      menuBtnBg.fillStyle(0x4a5568, 1);
      menuBtnBg.fillRoundedRect(-100, 75, 200, 40, 12);
      menuBtnBg.lineStyle(2, 0x6b7a8c, 1);
      menuBtnBg.strokeRoundedRect(-100, 75, 200, 40, 12);
    });

    // Popup entrance animation
    this.gameOverPopup.setScale(0.5);
    this.gameOverPopup.setAlpha(0);
    this.scene.tweens.add({
      targets: this.gameOverPopup,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  showPausePopup() {
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.pausePopup = this.scene.add.container(cx, cy);
    this.pausePopup.setDepth(100);

    // Semi-transparent overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.75);
    overlay.setInteractive();
    this.pausePopup.add(overlay);

    // Popup background with rounded corners
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.95);
    bg.fillRoundedRect(-210, -140, 420, 280, 16);
    bg.lineStyle(3, 0x3b82f6, 1);
    bg.strokeRoundedRect(-210, -140, 420, 280, 16);
    this.pausePopup.add(bg);

    // Title
    const title = this.scene.add.text(0, -100, "⏸ PAUSED", {
      fontSize: "38px",
      color: "#ffffff",
      fontStyle: "bold",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 8, fill: true },
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(title);

    // Level info
    const level = levels[this.currentLevel] ?? levels[0]!;
    const levelInfo = this.scene.add.text(0, -60, level.title, {
      fontSize: "16px",
      color: "#a0b8cc",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(levelInfo);

    // Score info
    const scoreInfo = this.scene.add.text(0, -35, `💎 Gems collected: ${this.score}`, {
      fontSize: "14px",
      color: "#ffee22",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(scoreInfo);

    // Resume button
    const resumeBg = this.scene.add.graphics();
    resumeBg.fillStyle(0x2563eb, 1);
    resumeBg.fillRoundedRect(-100, 0, 200, 48, 12);
    resumeBg.lineStyle(2, 0x3b82f6, 1);
    resumeBg.strokeRoundedRect(-100, 0, 200, 48, 12);
    this.pausePopup.add(resumeBg);

    const resumeText = this.scene.add.text(0, 24, "▶ Resume", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(resumeText);

    const resumeHit = new Phaser.Geom.Rectangle(-100, 0, 200, 48);
    const resumeBtn = this.scene.add.zone(0, 24, 200, 48)
      .setInteractive({ hitArea: resumeHit, useHandCursor: true });
    this.pausePopup.add(resumeBtn);
    resumeBtn.on("pointerdown", () => {
      this.togglePause();
    });
    resumeBtn.on("pointerover", () => {
      resumeBg.clear();
      resumeBg.fillStyle(0x3b82f6, 1);
      resumeBg.fillRoundedRect(-100, 0, 200, 48, 12);
      resumeBg.lineStyle(2, 0x60a5fa, 1);
      resumeBg.strokeRoundedRect(-100, 0, 200, 48, 12);
    });
    resumeBtn.on("pointerout", () => {
      resumeBg.clear();
      resumeBg.fillStyle(0x2563eb, 1);
      resumeBg.fillRoundedRect(-100, 0, 200, 48, 12);
      resumeBg.lineStyle(2, 0x3b82f6, 1);
      resumeBg.strokeRoundedRect(-100, 0, 200, 48, 12);
    });

    // Restart button
    const restartBg = this.scene.add.graphics();
    restartBg.fillStyle(0xdc2626, 1);
    restartBg.fillRoundedRect(-100, 60, 200, 48, 12);
    restartBg.lineStyle(2, 0xef4444, 1);
    restartBg.strokeRoundedRect(-100, 60, 200, 48, 12);
    this.pausePopup.add(restartBg);

    const restartText = this.scene.add.text(0, 84, "🔄 Restart Level", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(restartText);

    const restartHit = new Phaser.Geom.Rectangle(-100, 60, 200, 48);
    const restartBtn = this.scene.add.zone(0, 84, 200, 48)
      .setInteractive({ hitArea: restartHit, useHandCursor: true });
    this.pausePopup.add(restartBtn);
    restartBtn.on("pointerdown", this.onRestart);
    restartBtn.on("pointerover", () => {
      restartBg.clear();
      restartBg.fillStyle(0xef4444, 1);
      restartBg.fillRoundedRect(-100, 60, 200, 48, 12);
      restartBg.lineStyle(2, 0xf87171, 1);
      restartBg.strokeRoundedRect(-100, 60, 200, 48, 12);
    });
    restartBtn.on("pointerout", () => {
      restartBg.clear();
      restartBg.fillStyle(0xdc2626, 1);
      restartBg.fillRoundedRect(-100, 60, 200, 48, 12);
      restartBg.lineStyle(2, 0xef4444, 1);
      restartBg.strokeRoundedRect(-100, 60, 200, 48, 12);
    });

    // Menu button
    const menuBg = this.scene.add.graphics();
    menuBg.fillStyle(0x4a5568, 1);
    menuBg.fillRoundedRect(-100, 120, 200, 48, 12);
    menuBg.lineStyle(2, 0x6b7a8c, 1);
    menuBg.strokeRoundedRect(-100, 120, 200, 48, 12);
    this.pausePopup.add(menuBg);

    const menuText = this.scene.add.text(0, 144, "🏠 Main Menu", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(menuText);

    const menuHit = new Phaser.Geom.Rectangle(-100, 120, 200, 48);
    const menuBtn = this.scene.add.zone(0, 144, 200, 48)
      .setInteractive({ hitArea: menuHit, useHandCursor: true });
    this.pausePopup.add(menuBtn);
    menuBtn.on("pointerdown", this.onMenu);
    menuBtn.on("pointerover", () => {
      menuBg.clear();
      menuBg.fillStyle(0x5a6a7a, 1);
      menuBg.fillRoundedRect(-100, 120, 200, 48, 12);
      menuBg.lineStyle(2, 0x7a8a9a, 1);
      menuBg.strokeRoundedRect(-100, 120, 200, 48, 12);
    });
    menuBtn.on("pointerout", () => {
      menuBg.clear();
      menuBg.fillStyle(0x4a5568, 1);
      menuBg.fillRoundedRect(-100, 120, 200, 48, 12);
      menuBg.lineStyle(2, 0x6b7a8c, 1);
      menuBg.strokeRoundedRect(-100, 120, 200, 48, 12);
    });

    // Keyboard shortcuts hint
    const shortcuts = this.scene.add.text(0, 185, "ESC to resume  •  R to restart", {
      fontSize: "12px",
      color: "#6b8aaa",
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pausePopup.add(shortcuts);

    // Popup entrance animation
    this.pausePopup.setScale(0.5);
    this.pausePopup.setAlpha(0);
    this.scene.tweens.add({
      targets: this.pausePopup,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  closePausePopup() {
    if (this.pausePopup) {
      this.pausePopup.destroy();
      this.pausePopup = null as any;
    }
    this.isPaused = false;
    // Update button icon back to pause
    const icon = this.pauseButton?.list[1] as Phaser.GameObjects.Text;
    if (icon) icon.setText("⏸");
  }

  setStatus(text: string, color: string = "#a0b8cc") {
    this.statusText.setText(text);
    this.statusText.setColor(color);
  }
}