import Phaser from "phaser";
import { levels } from "./levels";

// Get sounds from the global (set by Game.tsx)
const getSounds = () => (window as any).__gameSounds;

// ─────────────────────────────────────────────
// MENU SCENE
// ─────────────────────────────────────────────
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(cx, height / 2, width, height, 0x0d1f35);
    const starG = this.add.graphics();
    starG.fillStyle(0xffffff, 1);
    for (let i = 0; i < 60; i++) {
      starG.fillRect(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.6),
        Math.random() > 0.7 ? 2 : 1,
        Math.random() > 0.7 ? 2 : 1
      );
    }

    // Title
    this.add.text(cx, 60, "🔥 FIRE & WATER 💧", {
      fontSize: "36px",
      color: "#ffffff",
      fontStyle: "bold",
      shadow: { offsetX: 2, offsetY: 2, color: "#000000", blur: 6, fill: true },
    }).setOrigin(0.5);

    this.add.text(cx, 100, "Get both players to their doors!", {
      fontSize: "14px",
      color: "#a0b8cc",
    }).setOrigin(0.5);

    // Controls legend
    const legendY = 148;
    this.add.text(cx - 120, legendY, "🔥 WASD to move", { fontSize: "13px", color: "#ff8866" }).setOrigin(0.5);
    this.add.text(cx + 120, legendY, "💧 Arrow keys", { fontSize: "13px", color: "#66ccff" }).setOrigin(0.5);

    // Divider
    this.add.rectangle(cx, 172, 500, 1, 0x2d4a6b);

    // Level select heading
    this.add.text(cx, 195, "SELECT LEVEL", {
      fontSize: "13px",
      color: "#6b8aaa",
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Level buttons
    levels.forEach((lvl, i) => {
      const btnY = 230 + i * 64;
      const isUnlocked = true;

      const bg = this.add.rectangle(cx, btnY, 440, 50, 0x112233, 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0x1e3a5c);

      const label = this.add.text(cx - 190, btnY, `${i + 1}`, {
        fontSize: "20px",
        color: "#2563eb",
        fontStyle: "bold",
      }).setOrigin(0, 0.5);

      this.add.text(cx - 150, btnY - 8, lvl.title.replace(/^Level \d+: /, ""), {
        fontSize: "16px",
        color: isUnlocked ? "#e8f0f8" : "#445566",
        fontStyle: "bold",
      }).setOrigin(0, 0.5);

      this.add.text(cx - 150, btnY + 10, `${lvl.gems.length} gems`, {
        fontSize: "12px",
        color: "#ffee22",
      }).setOrigin(0, 0.5);

      const pips = i + 1;
      for (let p = 0; p < pips; p++) {
        const col = pips <= 2 ? 0x22cc66 : pips <= 4 ? 0xfbbf24 : 0xef4444;
        this.add.circle(cx + 140 + p * 14, btnY, 4, col);
      }

      const arrow = this.add.text(cx + 190, btnY, "▶", {
        fontSize: "16px",
        color: "#2563eb",
      }).setOrigin(0.5);

      bg.on("pointerover", () => {
        bg.setFillStyle(0x1a3a5c);
        bg.setStrokeStyle(2, 0x2563eb);
        arrow.setColor("#66aaff");
        label.setColor("#66aaff");
      });
      bg.on("pointerout", () => {
        bg.setFillStyle(0x112233);
        bg.setStrokeStyle(1, 0x1e3a5c);
        arrow.setColor("#2563eb");
        label.setColor("#2563eb");
      });
      bg.on("pointerdown", () => {
        const sounds = getSounds();
        if (sounds) sounds.playMove();
        
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("FireAndWaterScene", { level: i });
        });
      });
    });

    // Store link (required by platform)
    this.add.text(cx, height - 20, "Built for freegamestore.online", {
      fontSize: "12px",
      color: "#4a7aaa",
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}

// ─────────────────────────────────────────────
// GAME SCENE
// ─────────────────────────────────────────────
type PlayerKeys = {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  R: Phaser.Input.Keyboard.Key;
  ESC: Phaser.Input.Keyboard.Key;
};

export class FireAndWaterScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: PlayerKeys;
  // private levelText!: Phaser.GameObjects.Text; // REMOVED - unused
  private statusText!: Phaser.GameObjects.Text;
  private fireIndicator!: Phaser.GameObjects.Text;
  private waterIndicator!: Phaser.GameObjects.Text;
  private fireboy!: Phaser.Physics.Arcade.Sprite;
  private watergirl!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private goals!: Phaser.Physics.Arcade.StaticGroup;
  private gems!: Phaser.Physics.Arcade.StaticGroup;
  private fireAtGoal = false;
  private waterAtGoal = false;
  private gameOver = false;
  private currentLevel = 0;
  private score = 0;

  constructor() {
    super("FireAndWaterScene");
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level ?? 0;
    this.fireAtGoal = false;
    this.waterAtGoal = false;
    this.gameOver = false;
    this.score = 0;
  }

  private makeTextures() {
    const g = this.add.graphics();

    // --- FIREBOY ---
    g.fillStyle(0xdd3311, 1);
    g.fillRect(8, 16, 24, 24);
    g.fillStyle(0xaa2200, 1);
    g.fillRect(8, 38, 10, 10);
    g.fillRect(22, 38, 10, 10);
    g.fillStyle(0xdd3311, 1);
    g.fillRect(2, 18, 8, 14);
    g.fillRect(30, 18, 8, 14);
    g.fillStyle(0xff6644, 1);
    g.fillCircle(20, 12, 12);
    g.fillStyle(0xffcc00, 1);
    g.fillTriangle(10, 8, 14, -4, 18, 6);
    g.fillTriangle(17, 4, 21, -8, 25, 2);
    g.fillTriangle(23, 6, 27, -2, 31, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 10, 4);
    g.fillCircle(26, 10, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(15, 10, 2);
    g.fillCircle(27, 10, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 8, 2, 2);
    g.fillRect(26, 8, 2, 2);
    g.fillStyle(0xff9966, 1);
    g.fillRect(14, 17, 12, 3);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(18, 17, 4, 3);
    g.generateTexture("fireboy", 40, 50);
    g.clear();

    // --- WATERGIRL ---
    g.fillStyle(0x2288cc, 1);
    g.fillRect(8, 16, 24, 24);
    g.fillStyle(0x1166aa, 1);
    g.fillTriangle(6, 38, 20, 30, 34, 38);
    g.fillRect(9, 38, 9, 10);
    g.fillRect(22, 38, 9, 10);
    g.fillStyle(0x2288cc, 1);
    g.fillRect(2, 18, 8, 14);
    g.fillRect(30, 18, 8, 14);
    g.fillStyle(0x55bbee, 1);
    g.fillCircle(20, 12, 12);
    g.fillStyle(0x88ddff, 1);
    g.fillTriangle(12, 0, 20, 14, 28, 0);
    g.fillStyle(0x55bbee, 1);
    g.fillCircle(12, 2, 4);
    g.fillCircle(28, 2, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 10, 4);
    g.fillCircle(26, 10, 4);
    g.fillStyle(0x004488, 1);
    g.fillCircle(15, 10, 2);
    g.fillCircle(27, 10, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 8, 2, 2);
    g.fillRect(26, 8, 2, 2);
    g.fillStyle(0x99eeff, 1);
    g.fillRect(14, 17, 12, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(17, 17, 6, 3);
    g.generateTexture("watergirl", 40, 50);
    g.clear();

    // Platform – stone tile
    g.fillStyle(0x5a6a78, 1);
    g.fillRect(0, 0, 200, 24);
    g.fillStyle(0x6b7d8c, 1);
    g.fillRect(2, 2, 196, 10);
    g.fillStyle(0x4a5a68, 1);
    g.fillRect(0, 18, 200, 6);
    g.lineStyle(1, 0x3d4f5c, 0.6);
    for (let x = 40; x < 200; x += 40) g.lineBetween(x, 0, x, 24);
    g.generateTexture("platform", 200, 24);
    g.clear();

    // Water hazard
    g.fillStyle(0x1155cc, 0.9);
    g.fillRect(0, 0, 200, 40);
    g.fillStyle(0x3388ff, 0.6);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0x88ccff, 0.4);
    for (let x = 10; x < 200; x += 30) g.fillEllipse(x, 6, 18, 6);
    g.generateTexture("waterBlock", 200, 40);
    g.clear();

    // Lava hazard
    g.fillStyle(0xcc2200, 0.9);
    g.fillRect(0, 0, 200, 40);
    g.fillStyle(0xff6600, 0.7);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0xffcc00, 0.5);
    for (let x = 15; x < 200; x += 35) g.fillEllipse(x, 6, 20, 7);
    g.generateTexture("lavaBlock", 200, 40);
    g.clear();

    // Goal fire door
    g.fillStyle(0x442200, 1);
    g.fillRect(0, 0, 64, 80);
    g.fillStyle(0xff6600, 0.4);
    g.fillRect(4, 4, 56, 72);
    g.lineStyle(3, 0xff8800, 1);
    g.strokeRect(0, 0, 64, 80);
    g.fillStyle(0xffcc00, 0.8);
    g.fillTriangle(14, 72, 22, 40, 30, 66);
    g.fillTriangle(24, 72, 32, 30, 40, 60);
    g.fillTriangle(34, 72, 42, 46, 50, 72);
    g.fillStyle(0xffffff, 0.7);
    g.fillTriangle(20, 66, 26, 48, 32, 62);
    g.generateTexture("goalFire", 64, 80);
    g.clear();

    // Goal water door
    g.fillStyle(0x002244, 1);
    g.fillRect(0, 0, 64, 80);
    g.fillStyle(0x0044aa, 0.4);
    g.fillRect(4, 4, 56, 72);
    g.lineStyle(3, 0x0088ff, 1);
    g.strokeRect(0, 0, 64, 80);
    g.fillStyle(0x55aaff, 0.7);
    g.fillTriangle(20, 20, 32, 55, 44, 20);
    g.fillStyle(0x88ddff, 0.5);
    g.fillTriangle(25, 26, 32, 48, 39, 26);
    g.fillStyle(0x3399ff, 0.5);
    g.fillEllipse(32, 60, 28, 16);
    g.generateTexture("goalWater", 64, 80);
    g.clear();

    // Gem (diamond)
    g.fillStyle(0xffee22, 1);
    g.fillTriangle(12, 6, 20, 2, 28, 6);
    g.fillRect(4, 6, 32, 14);
    g.fillTriangle(4, 20, 20, 36, 36, 20);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(14, 6, 20, 4, 26, 6);
    g.fillTriangle(14, 6, 14, 20, 20, 13);
    g.generateTexture("gem", 40, 38);
    g.clear();

    g.destroy();
  }

  create() {
    const sounds = getSounds();
    if (sounds) sounds.playMove();

    this.makeTextures();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as PlayerKeys;

    this.input.keyboard?.enableGlobalCapture();
    this.physics.world.setBounds(0, 0, 960, 640);

    this.createBg();
    this.createPlayers();
    this.createLevel();
    this.createUI();
    this.setupCollisions();

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  private createBg() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d1f35);
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(width / 2, 60 + i * 60, width, 60, 0x0a1828 + i * 0x010204, 0.4);
    }
    const starG = this.add.graphics();
    starG.fillStyle(0xffffff, 1);
    for (let i = 0; i < 40; i++) {
      const sx = Phaser.Math.Between(0, 960);
      const sy = Phaser.Math.Between(0, 280);
      const sz = Math.random() > 0.7 ? 2 : 1;
      starG.fillRect(sx, sy, sz, sz);
    }
    this.add.rectangle(width / 2, height - 10, width, 20, 0x1a3a5c);
  }

  private createPlayers() {
    const level = levels[this.currentLevel] ?? levels[0]!;
    this.fireboy = this.physics.add.sprite(level.fireStart.x, level.fireStart.y, "fireboy");
    this.watergirl = this.physics.add.sprite(level.waterStart.x, level.waterStart.y, "watergirl");

    [this.fireboy, this.watergirl].forEach((p) => {
      p.setBounce(0.05).setCollideWorldBounds(true).setDragX(1100).setDepth(4);
      p.setBodySize(28, 44).setOffset(6, 4);
      (p.body as Phaser.Physics.Arcade.Body).setGravityY(700);
    });
  }

  private createLevel() {
    const level = levels[this.currentLevel] ?? levels[0]!;
    this.fireAtGoal = false;
    this.waterAtGoal = false;
    this.gameOver = false;

    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.goals = this.physics.add.staticGroup();
    this.gems = this.physics.add.staticGroup();

    level.platforms.forEach((p) => {
      const b = this.platforms.create(p.x, p.y, "platform") as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(p.width, p.height).setOrigin(0.5).refreshBody();
    });

    level.hazards.forEach((h) => {
      const tex = h.type === "water" ? "waterBlock" : "lavaBlock";
      const b = this.hazards.create(h.x, h.y, tex) as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(h.width, h.height).setOrigin(0.5).refreshBody();
      b.setData("type", h.type);
    });

    level.goals.forEach((gl) => {
      const tex = gl.type === "fire" ? "goalFire" : "goalWater";
      const b = this.goals.create(gl.x, gl.y, tex) as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(gl.width, gl.height).setOrigin(0.5).refreshBody();
      b.setData("type", gl.type);
    });

    level.gems.forEach((gm) => {
      const b = this.gems.create(gm.x, gm.y, "gem") as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(28, 26).setOrigin(0.5).refreshBody();
      b.setData("collected", false);
    });
  }

  private createUI() {
    const level = levels[this.currentLevel] ?? levels[0]!;

    // Level title text - no assignment needed
    this.add
      .text(16, 12, level.title, {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        shadow: { offsetX: 1, offsetY: 1, color: "#000000", blur: 2, fill: true },
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.statusText = this.add
      .text(16, 36, "WASD = 🔥  |  Arrows = 💧  |  R = Restart  |  ESC = Menu", {
        fontSize: "12px",
        color: "#a0b8cc",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.fireIndicator = this.add
      .text(16, 600, "🔥 Moving", { fontSize: "13px", color: "#ff8866" })
      .setScrollFactor(0)
      .setDepth(10);

    this.waterIndicator = this.add
      .text(200, 600, "💧 Moving", { fontSize: "13px", color: "#66ccff" })
      .setScrollFactor(0)
      .setDepth(10);
  }

  private setupCollisions() {
    this.physics.add.collider(this.fireboy, this.platforms);
    this.physics.add.collider(this.watergirl, this.platforms);

    this.physics.add.overlap(this.fireboy, this.hazards, (_, hz) => {
      this.handleHazard("fire", (hz as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.physics.add.overlap(this.watergirl, this.hazards, (_, hz) => {
      this.handleHazard("water", (hz as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.physics.add.overlap(this.fireboy, this.goals, (_, gl) => {
      this.handleGoal("fire", (gl as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.physics.add.overlap(this.watergirl, this.goals, (_, gl) => {
      this.handleGoal("water", (gl as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.physics.add.overlap(this.fireboy, this.gems, (_, gm) => {
      this.collectGem(gm as Phaser.GameObjects.GameObject);
    });
    this.physics.add.overlap(this.watergirl, this.gems, (_, gm) => {
      this.collectGem(gm as Phaser.GameObjects.GameObject);
    });
  }

  private collectGem(gem: Phaser.GameObjects.GameObject) {
    if (gem.getData("collected")) return;
    gem.setData("collected", true);
    gem.destroy();
    
    const sounds = getSounds();
    if (sounds) sounds.playScore();
    
    this.score++;
    this.cameras.main.shake(80, 0.008);
  }

  private handleHazard(player: "fire" | "water", hazardType: string) {
    if (this.gameOver) return;
    if (
      (player === "fire" && hazardType === "water") ||
      (player === "water" && hazardType === "lava")
    ) {
      this.gameOver = true;
      const sounds = getSounds();
      if (sounds) sounds.playError();
      
      this.statusText.setText("💀 Oops! Press R to retry.");
      this.statusText.setColor("#ff4444");
      this.flashScene(player === "fire" ? 0x1155cc : 0xcc2200);
      this.disablePlayers();
    }
  }

  private handleGoal(player: "fire" | "water", goalType: string) {
    if (this.gameOver) return;

    if (player === "fire" && goalType === "fire" && !this.fireAtGoal) {
      this.fireAtGoal = true;
      this.fireIndicator.setText("🔥 At goal! ✓");
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();

      this.fireboy.setVelocity(0, 0);
      (this.fireboy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.fireboy.setAlpha(0.6);

      this.statusText.setText("🔥 Ready! Waiting for 💧...");
      this.statusText.setColor("#ffaa44");
    }

    if (player === "water" && goalType === "water" && !this.waterAtGoal) {
      this.waterAtGoal = true;
      this.waterIndicator.setText("💧 At goal! ✓");
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();

      this.watergirl.setVelocity(0, 0);
      (this.watergirl.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.watergirl.setAlpha(0.6);

      this.statusText.setText("💧 Ready! Waiting for 🔥...");
      this.statusText.setColor("#44aaff");
    }

    if (this.fireAtGoal && this.waterAtGoal) {
      this.gameOver = true;
      const nextLevel = this.currentLevel + 1;
      const sounds = getSounds();
      if (sounds) sounds.playGameOver();

      if (nextLevel < levels.length) {
        this.statusText.setText("✨ Level complete! Loading next level...");
        this.statusText.setColor("#44ff88");
        this.flashScene(0x22cc66);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.restart({ level: nextLevel });
        });
      } else {
        this.statusText.setText("🏆 You beat all 5 levels! Press R to replay or ESC for menu.");
        this.statusText.setColor("#ffee44");
        this.flashScene(0x22cc66);
      }
    }
  }

  private disablePlayers() {
    this.fireboy.setVelocity(0, 0);
    this.watergirl.setVelocity(0, 0);
    (this.fireboy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    (this.watergirl.body as Phaser.Physics.Arcade.Body).allowGravity = false;
  }

  private flashScene(color: number) {
    const f = this.add.rectangle(480, 320, 960, 640, color, 0.25).setDepth(50);
    this.tweens.add({ targets: f, alpha: 0, duration: 400, onComplete: () => f.destroy() });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.goToMenu();
      return;
    }

    if (this.keys.R.isDown) {
      this.scene.restart({ level: this.currentLevel });
      return;
    }

    if (this.gameOver) return;

    const fd = {
      left: this.keys.A.isDown,
      right: this.keys.D.isDown,
      jump: this.keys.W.isDown,
    };
    const wd = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      jump: this.cursors.up.isDown,
    };

    if (!this.fireAtGoal) this.movePlayer(this.fireboy, fd);
    if (!this.waterAtGoal) this.movePlayer(this.watergirl, wd);

    const t = this.time.now / 300;
    if (!this.fireAtGoal && (this.fireboy.body as Phaser.Physics.Arcade.Body).blocked.down && !fd.left && !fd.right) {
      this.fireboy.y += Math.sin(t) * 0.3;
    }
    if (!this.waterAtGoal && (this.watergirl.body as Phaser.Physics.Arcade.Body).blocked.down && !wd.left && !wd.right) {
      this.watergirl.y += Math.sin(t + 1) * 0.3;
    }
  }

  private movePlayer(
    player: Phaser.Physics.Arcade.Sprite,
    actions: { left: boolean; right: boolean; jump: boolean }
  ) {
    const speed = 260;
    const jumpPower = 450;
    const body = player.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    if (actions.left) {
      player.setVelocityX(-speed);
      player.setFlipX(true);
    } else if (actions.right) {
      player.setVelocityX(speed);
      player.setFlipX(false);
    } else if (body.blocked.down) {
      player.setVelocityX(0);
    }

    if (actions.jump && body.blocked.down) {
      player.setVelocityY(-jumpPower);
      const sounds = getSounds();
      if (sounds) sounds.playMove();
    }
  }

  private goToMenu() {
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("MenuScene");
    });
  }
}