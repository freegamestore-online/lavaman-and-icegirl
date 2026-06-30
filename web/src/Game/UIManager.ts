// UIManager.ts
import Phaser from "phaser";
import { levelDefs } from "../levels";

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
  private pauseButton!: Phaser.GameObjects.Container;
  private isPaused = false;

  constructor(
    scene: Phaser.Scene,
    currentLevel: number,
    score: number,
    onRestart: () => void,
    onMenu: () => void
  ) {
    this.scene = scene;
    this.currentLevel = currentLevel;
    this.score = score;
    this.onRestart = onRestart;
    this.onMenu = onMenu;
  }

  createUI() {
    const level = levelDefs[this.currentLevel] ?? levelDefs[0]!;
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;

    // ---- TOP BAR ----
    const topBar = this.scene.add.graphics();
    topBar.fillStyle(0x0a1828, 0.92);
    topBar.fillRect(0, 0, W, 44);
    topBar.setDepth(9).setScrollFactor(0);

    // Title
    this.scene.add
      .text(12, 10, level.title, {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // Level number
    this.scene.add
      .text(W - 80, 10, `LVL ${this.currentLevel + 1}/${levelDefs.length}`, {
        fontSize: "12px",
        color: "#60a5fa",
        fontStyle: "bold",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // Controls hint
    this.statusText = this.scene.add
      .text(12, 28, "WASD=🔥  Arrows=💧  R=Restart  ESC=Pause", {
        fontSize: "9px",
        color: "#a0b8cc",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // ---- BOTTOM BAR ----
    const botBar = this.scene.add.graphics();
    botBar.fillStyle(0x0a1828, 0.85);
    botBar.fillRect(0, H - 32, W, 32);
    botBar.setDepth(9).setScrollFactor(0);

    // Gem counter
    this.scene.add
      .text(10, H - 24, `💎 ${this.score}`, {
        fontSize: "14px",
        color: "#ffee22",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // Fire indicator
    this.fireIndicator = this.scene.add
      .text(60, H - 24, "🔥 Moving", {
        fontSize: "11px",
        color: "#ff8866",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    // Water indicator
    this.waterIndicator = this.scene.add
      .text(W / 2 + 20, H - 24, "💧 Moving", {
        fontSize: "11px",
        color: "#66ccff",
        resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.createPauseButton();
  }

  private createPauseButton() {
    const x = this.scene.scale.width - 24;
    const y = 22;

    this.pauseButton = this.scene.add.container(x, y);
    this.pauseButton.setDepth(20).setScrollFactor(0);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.85);
    bg.fillCircle(0, 0, 16);
    bg.lineStyle(1.5, 0x3b82f6, 1);
    bg.strokeCircle(0, 0, 16);
    this.pauseButton.add(bg);

    const icon = this.scene.add.text(0, 0, "⏸", {
      fontSize: "14px", 
      color: "#ffffff", 
      resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    this.pauseButton.add(icon);

    const hitZone = this.scene.add.zone(0, 0, 36, 36)
      .setInteractive({ hitArea: new Phaser.Geom.Circle(0, 0, 18), useHandCursor: true });
    this.pauseButton.add(hitZone);

    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x2a4a6a, 0.9);
      bg.fillCircle(0, 0, 16);
      bg.lineStyle(1.5, 0x60a5fa, 1);
      bg.strokeCircle(0, 0, 16);
    });
    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x1a2a3a, 0.85);
      bg.fillCircle(0, 0, 16);
      bg.lineStyle(1.5, 0x3b82f6, 1);
      bg.strokeCircle(0, 0, 16);
    });
    hitZone.on("pointerdown", () => this.togglePause());
  }

  togglePause() {
    if (this.isPaused) {
      this.closePausePopup();
      this.isPaused = false;
      const icon = this.pauseButton.list[1] as Phaser.GameObjects.Text;
      if (icon) icon.setText("⏸");
    } else {
      this.showPausePopup();
      this.isPaused = true;
      const icon = this.pauseButton.list[1] as Phaser.GameObjects.Text;
      if (icon) icon.setText("▶");
    }
  }

  updateIndicators(fireAtGoal: boolean, waterAtGoal: boolean) {
    if (this.fireIndicator) {
      this.fireIndicator.setText(fireAtGoal ? "🔥 At goal ✓" : "🔥 Moving");
    }
    if (this.waterIndicator) {
      this.waterIndicator.setText(waterAtGoal ? "💧 At goal ✓" : "💧 Moving");
    }
  }

  updateScore(newScore: number) {
    this.score = newScore;
    // Update the gem counter - find and update it
    const gems = this.scene.children.getChildren();
    for (const child of gems) {
      if (child instanceof Phaser.GameObjects.Text && child.text?.startsWith("💎")) {
        child.setText(`💎 ${this.score}`);
        break;
      }
    }
  }

  showGameOverPopup() {
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;

    this.gameOverPopup = this.scene.add.container(cx, cy);
    this.gameOverPopup.setDepth(100);

    const overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.75);
    overlay.setInteractive();
    this.gameOverPopup.add(overlay);

    const bw = 280, bh = 190;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.97);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
    bg.lineStyle(2.5, 0xff4444, 1);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
    this.gameOverPopup.add(bg);

    this.gameOverPopup.add(
      this.scene.add.text(0, -70, "💀 GAME OVER", {
        fontSize: "28px", color: "#ff4444", fontStyle: "bold",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 8, fill: true },
        resolution: 2, fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );

    this.gameOverPopup.add(
      this.scene.add.text(0, -36, "Wrong element!", {
        fontSize: "14px", color: "#ffaa88", resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );

    this._addPopupBtn(this.gameOverPopup, 0, 10, 220, 44, 0x2563eb, 0x3b82f6, "🔄 Restart", this.onRestart);
    this._addPopupBtn(this.gameOverPopup, 0, 64, 220, 38, 0x4a5568, 0x5a6a7a, "🏠 Main Menu", this.onMenu);

    this._animatePopup(this.gameOverPopup);
  }

  showPausePopup() {
    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;

    this.pausePopup = this.scene.add.container(cx, cy);
    this.pausePopup.setDepth(100);

    const overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.75);
    overlay.setInteractive();
    this.pausePopup.add(overlay);

    const bw = 280, bh = 240;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2a3a, 0.97);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
    bg.lineStyle(2.5, 0x3b82f6, 1);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
    this.pausePopup.add(bg);

    this.pausePopup.add(
      this.scene.add.text(0, -95, "⏸ PAUSED", {
        fontSize: "30px", color: "#ffffff", fontStyle: "bold",
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 8, fill: true },
        resolution: 2, fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );

    const level = levelDefs[this.currentLevel] ?? levelDefs[0]!;
    this.pausePopup.add(
      this.scene.add.text(0, -58, level.title, {
        fontSize: "13px", color: "#a0b8cc", resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );
    this.pausePopup.add(
      this.scene.add.text(0, -38, `💎 ${this.score} gem${this.score !== 1 ? "s" : ""} collected`, {
        fontSize: "12px", color: "#ffee22", resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );

    this._addPopupBtn(this.pausePopup, 0, -10, 220, 44, 0x2563eb, 0x3b82f6, "▶ Resume", () => this.togglePause());
    this._addPopupBtn(this.pausePopup, 0, 44, 220, 44, 0xdc2626, 0xef4444, "🔄 Restart", this.onRestart);
    this._addPopupBtn(this.pausePopup, 0, 98, 220, 38, 0x4a5568, 0x5a6a7a, "🏠 Main Menu", this.onMenu);

    this.pausePopup.add(
      this.scene.add.text(0, 148, "ESC to resume", {
        fontSize: "10px", color: "#6b8aaa", resolution: 2,
        fontFamily: "Manrope, system-ui, sans-serif",
      }).setOrigin(0.5)
    );

    this._animatePopup(this.pausePopup);
  }

  private _addPopupBtn(
    container: Phaser.GameObjects.Container,
    x: number, y: number,
    w: number, h: number,
    colorNormal: number, colorHover: number,
    label: string,
    callback: () => void
  ) {
    const bg = this.scene.add.graphics();
    const drawBg = (col: number) => {
      bg.clear();
      bg.fillStyle(col, 1);
      bg.fillRoundedRect(x - w / 2, y, w, h, 10);
      bg.lineStyle(1.5, col + 0x222222, 1);
      bg.strokeRoundedRect(x - w / 2, y, w, h, 10);
    };
    drawBg(colorNormal);
    container.add(bg);

    const txt = this.scene.add.text(x, y + h / 2, label, {
      fontSize: "15px", color: "#ffffff", fontStyle: "bold", resolution: 2,
      fontFamily: "Manrope, system-ui, sans-serif",
    }).setOrigin(0.5);
    container.add(txt);

    const hitZone = this.scene.add.zone(x, y + h / 2, w, h)
      .setInteractive({ hitArea: new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), useHandCursor: true });
    container.add(hitZone);

    hitZone.on("pointerover", () => drawBg(colorHover));
    hitZone.on("pointerout",  () => drawBg(colorNormal));
    hitZone.on("pointerdown", callback);
  }

  private _animatePopup(popup: Phaser.GameObjects.Container) {
    popup.setScale(0.5).setAlpha(0);
    this.scene.tweens.add({
      targets: popup, scale: 1, alpha: 1, duration: 280, ease: "Back.easeOut",
    });
  }

  closePausePopup() {
    if (this.pausePopup) {
      this.pausePopup.destroy();
      this.pausePopup = null as any;
    }
    this.isPaused = false;
    const icon = this.pauseButton?.list[1] as Phaser.GameObjects.Text;
    if (icon) icon.setText("⏸");
  }

  setStatus(text: string, color = "#a0b8cc") {
    if (this.statusText) {
      this.statusText.setText(text);
      this.statusText.setColor(color);
    }
  }
}