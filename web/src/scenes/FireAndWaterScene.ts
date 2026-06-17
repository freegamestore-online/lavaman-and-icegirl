import Phaser from "phaser";
import { TextureGenerator } from "../utils/TextureGenerator";
import { LevelManager } from "../Game/LevelManager";
import { UIManager } from "../Game/UIManager";
import { CollisionManager } from "../Game/CollisionManager";

const getSounds = () => (window as any).__gameSounds;

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
  private fireboy!: Phaser.Physics.Arcade.Sprite;
  private watergirl!: Phaser.Physics.Arcade.Sprite;
  private fireAtGoal = false;
  private waterAtGoal = false;
  private gameOver = false;
  private currentLevel = 0;
  private score = 0;

  private levelManager!: LevelManager;
  private uiManager!: UIManager;
  private collisionManager!: CollisionManager;

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

  create() {
    const sounds = getSounds();
    if (sounds) sounds.playMove();

    TextureGenerator.generateAll(this);

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
    this.createLevel();
    this.createPlayers();
    this.setupUI();
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

  private createLevel() {
    this.levelManager = new LevelManager(this, this.currentLevel);
    this.levelManager.createLevel();
  }

  private createPlayers() {
    const level = this.levelManager.getCurrentLevelData();
    this.fireboy = this.physics.add.sprite(level.fireStart.x, level.fireStart.y, "fireboy");
    this.watergirl = this.physics.add.sprite(level.waterStart.x, level.waterStart.y, "watergirl");

    [this.fireboy, this.watergirl].forEach((p) => {
      p.setBounce(0.05).setCollideWorldBounds(true).setDragX(1100).setDepth(4);
      p.setBodySize(28, 44).setOffset(6, 4);
      (p.body as Phaser.Physics.Arcade.Body).setGravityY(700);
    });
  }

  private setupUI() {
    this.uiManager = new UIManager(
      this,
      this.currentLevel,
      this.score,
      () => this.scene.restart({ level: this.currentLevel }),
      () => this.goToMenu(),
      // () => this.uiManager.closePausePopup()
    );
    this.uiManager.createUI();
  }

  private setupCollisions() {
    this.collisionManager = new CollisionManager(
      this,
      this.fireboy,
      this.watergirl,
      this.levelManager.platforms,
      this.levelManager.hazards,
      this.levelManager.goals,
      this.levelManager.gems
    );

    this.collisionManager.setup(
      (player, hazardType) => this.handleHazard(player, hazardType),
      (player, goalType) => this.handleGoal(player, goalType),
      (gem) => this.collectGem(gem)
    );
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

      this.uiManager.setStatus("💀 Oops! Press R to retry.", "#ff4444");
      this.flashScene(player === "fire" ? 0x1155cc : 0xcc2200);
      this.disablePlayers();
      this.uiManager.showGameOverPopup();
    }
  }

  private handleGoal(player: "fire" | "water", goalType: string) {
    if (this.gameOver) return;

    if (player === "fire" && goalType === "fire" && !this.fireAtGoal) {
      this.fireAtGoal = true;
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();

      this.fireboy.setVelocity(0, 0);
      (this.fireboy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.fireboy.setAlpha(0.6);

      this.uiManager.setStatus("🔥 Ready! Waiting for 💧...", "#ffaa44");
    }

    if (player === "water" && goalType === "water" && !this.waterAtGoal) {
      this.waterAtGoal = true;
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();

      this.watergirl.setVelocity(0, 0);
      (this.watergirl.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      this.watergirl.setAlpha(0.6);

      this.uiManager.setStatus("💧 Ready! Waiting for 🔥...", "#44aaff");
    }

    this.uiManager.updateIndicators(this.fireAtGoal, this.waterAtGoal);

    if (this.fireAtGoal && this.waterAtGoal) {
      this.gameOver = true;
      const nextLevel = this.currentLevel + 1;
      const sounds = getSounds();
      if (sounds) sounds.playGameOver();

      if (this.levelManager.hasNextLevel()) {
        this.uiManager.setStatus("✨ Level complete! Loading next level...", "#44ff88");
        this.flashScene(0x22cc66);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.restart({ level: nextLevel });
        });
      } else {
        this.uiManager.setStatus("🏆 You beat all 5 levels! Press R to replay or ESC for menu.", "#ffee44");
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
    // Handle ESC key - toggle pause
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      // If game over popup is showing, go to menu
      if (this.gameOverPopup && this.gameOverPopup.active) {
        this.goToMenu();
        return;
      }
      // Toggle pause
      if (!this.gameOver) {
        this.uiManager.togglePause();
        return;
      }
      this.goToMenu();
      return;
    }

    if (this.keys.R.isDown) {
      if (this.gameOver || (this.pausePopup && this.pausePopup.active)) {
        this.scene.restart({ level: this.currentLevel });
        return;
      }
      this.scene.restart({ level: this.currentLevel });
      return;
    }

    if (this.gameOver) return;
    if (this.pausePopup && this.pausePopup.active) return;
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

  // Helper getters for UI Manager
  private get gameOverPopup() { return this.uiManager.gameOverPopup; }
  private get pausePopup() { return this.uiManager.pausePopup; }
  private set pausePopup(value) { this.uiManager.pausePopup = value; }

  // private showPausePopup() {
  //   this.uiManager.showPausePopup();
  // }
}