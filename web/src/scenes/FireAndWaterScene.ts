import Phaser from "phaser";
import { TextureGenerator } from "../utils/TextureGenerator";
import { LevelManager } from "../Game/LevelManager";
import { UIManager } from "../Game/UIManager";
import { CollisionManager } from "../Game/CollisionManager";
import { getScaleFactor } from "../levels";


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

  private mobileControls = { left: false, right: false, jump: false };
  private activeMobileCharacter: "fire" | "water" = "fire";
  private isUsingMobileControls = false;

  constructor() {
    super("FireAndWaterScene");
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level ?? 0;
    this.fireAtGoal = false;
    this.waterAtGoal = false;
    this.gameOver = false;
    this.score = 0;
    this.game.events.emit("game-active", true);
  }

  create() {

    const { width, height } = this.scale;
    import("../levels").then(({ setScaleFactor }) => {
      setScaleFactor(width, height);
    });
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
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

    this.createBg();
    this.createLevel();
    this.createPlayers();
    this.setupUI();
    this.setupCollisions();

    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.game.events.emit("game-active", true);
  }

  shutdown() {
    this.game.events.emit("game-active", false);
  }

  private createBg() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1f35);
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(W / 2, 50 + i * 50, W, 50, 0x0a1828 + i * 0x010204, 0.35);
    }
    const starG = this.add.graphics();
    starG.fillStyle(0xffffff, 1);
    for (let i = 0; i < 30; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, 200);
      const sz = Math.random() > 0.7 ? 2 : 1;
      starG.fillRect(sx, sy, sz, sz);
    }
    this.add.rectangle(W / 2, H - 8, W, 16, 0x1a3a5c);
  }

  private createLevel() {
    this.levelManager = new LevelManager(this, this.currentLevel);
    this.levelManager.createLevel();
  }

  private createPlayers() {
    const level = this.levelManager.getCurrentLevelData();
    const scale = getScaleFactor();

    this.fireboy = this.physics.add.sprite(level.fireStart.x, level.fireStart.y, "fireboy");
    this.watergirl = this.physics.add.sprite(level.waterStart.x, level.waterStart.y, "watergirl");

    [this.fireboy, this.watergirl].forEach((p) => {
      p.setScale(scale);
      p.setBounce(0.05).setCollideWorldBounds(true).setDragX(1100).setDepth(4);
      p.setBodySize(20, 32).setOffset(4, 3); // body size stays in texture-space, setScale handles the rest
      (p.body as Phaser.Physics.Arcade.Body).setGravityY(700);
    });
  }

  private setupUI() {
    this.uiManager = new UIManager(
      this,
      this.currentLevel,
      this.score,
      () => this.scene.restart({ level: this.currentLevel }),
      () => this.goToMenu()
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
      this.levelManager.goalPlatforms,
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
    this.uiManager.updateScore(this.score);
    this.cameras.main.shake(60, 0.006);
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
    if (player === "fire" && goalType !== "fire") return;
    if (player === "water" && goalType !== "water") return;
  }

  private updateGoalState() {
    const wasFireAtGoal = this.fireAtGoal;
    const wasWaterAtGoal = this.waterAtGoal;

    this.fireAtGoal = this.isPlayerOnGoalPlatform(this.fireboy, "fire");
    this.waterAtGoal = this.isPlayerOnGoalPlatform(this.watergirl, "water");

    if (!wasFireAtGoal && this.fireAtGoal) {
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();
      this.uiManager.setStatus("🔥 Ready! Waiting for 💧...", "#ffaa44");
    }
    if (!wasWaterAtGoal && this.waterAtGoal) {
      const sounds = getSounds();
      if (sounds) sounds.playLevelUp();
      this.uiManager.setStatus("💧 Ready! Waiting for 🔥...", "#44aaff");
    }

    if ((wasFireAtGoal && !this.fireAtGoal) || (wasWaterAtGoal && !this.waterAtGoal)) {
      this.uiManager.setStatus("Stand on both goal ledges to continue", "#d7ecff");
    }

    this.uiManager.updateIndicators(this.fireAtGoal, this.waterAtGoal);

    if (!this.gameOver && this.fireAtGoal && this.waterAtGoal) {
      this.completeLevel();
    }
  }

  private isPlayerOnGoalPlatform(
    player: Phaser.Physics.Arcade.Sprite,
    goalType: "fire" | "water"
  ): boolean {
    const body = player.body as Phaser.Physics.Arcade.Body | null;
    if (!body || !body.blocked.down) return false;

    const goalPlatforms = this.levelManager.goalPlatforms.getChildren() as Phaser.Physics.Arcade.Image[];
    const matchingPlatform = goalPlatforms.find(
      (platform) => platform.getData("type") === goalType
    );
    if (!matchingPlatform) return false;

    const platformBody = matchingPlatform.body as Phaser.Physics.Arcade.StaticBody | null;
    if (!platformBody) return false;

    const footY = body.bottom;
    const topY = platformBody.top;
    const feetNearTop = Math.abs(footY - topY) <= 6;
    const overlapsHorizontally = body.right > platformBody.left + 2 && body.left < platformBody.right - 2;

    return feetNearTop && overlapsHorizontally;
  }

  private completeLevel() {
    this.gameOver = true;
    const nextLevel = this.currentLevel + 1;
    const sounds = getSounds();
    if (sounds) sounds.playGameOver();

    this.fireboy.setVelocity(0, 0);
    this.watergirl.setVelocity(0, 0);
    (this.fireboy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    (this.watergirl.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    this.uiManager.setStatus("🚪 Exiting...", "#b6ffd7");

    const fireGoal = this.getGoalByType("fire");
    const waterGoal = this.getGoalByType("water");
    const activeTweens: Phaser.Tweens.Tween[] = [];

    if (fireGoal) {
      activeTweens.push(
        this.tweens.add({
          targets: this.fireboy,
          x: fireGoal.x,
          y: fireGoal.y + fireGoal.displayHeight * 0.2,
          scaleX: this.fireboy.scaleX * 0.35,
          scaleY: this.fireboy.scaleY * 0.35,
          alpha: 0.25,
          duration: 420,
          ease: "Sine.In",
        })
      );
    }

    if (waterGoal) {
      activeTweens.push(
        this.tweens.add({
          targets: this.watergirl,
          x: waterGoal.x,
          y: waterGoal.y + waterGoal.displayHeight * 0.2,
          scaleX: this.watergirl.scaleX * 0.35,
          scaleY: this.watergirl.scaleY * 0.35,
          alpha: 0.25,
          duration: 420,
          ease: "Sine.In",
        })
      );
    }

    this.time.delayedCall(activeTweens.length > 0 ? 460 : 0, () => {
      this.finishLevelTransition(nextLevel);
    });
  }

  private getGoalByType(goalType: "fire" | "water") {
    const goals = this.levelManager.goals.getChildren() as Phaser.Physics.Arcade.Image[];
    return goals.find((goal) => goal.getData("type") === goalType);
  }

  private finishLevelTransition(nextLevel: number) {
    if (!this.gameOver) return;

    if (this.levelManager.hasNextLevel()) {
      this.uiManager.setStatus("✨ Level complete!", "#44ff88");
      this.flashScene(0x22cc66);
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.restart({ level: nextLevel });
      });
    } else {
      this.uiManager.setStatus("🏆 All levels cleared! Press R to replay.", "#ffee44");
      this.flashScene(0x22cc66);
    }
  }

  private disablePlayers() {
    this.fireboy.setVelocity(0, 0);
    this.watergirl.setVelocity(0, 0);
    (this.fireboy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    (this.watergirl.body as Phaser.Physics.Arcade.Body).allowGravity = false;
  }

  private flashScene(color: number) {
    const W = this.scale.width;
    const H = this.scale.height;
    const f = this.add.rectangle(W / 2, H / 2, W, H, color, 0.25).setDepth(50);
    this.tweens.add({ targets: f, alpha: 0, duration: 400, onComplete: () => f.destroy() });
  }

  setMobileControls(
    controls: { left: boolean; right: boolean; jump: boolean },
    activeCharacter: "fire" | "water"
  ) {
    this.mobileControls = controls;
    this.activeMobileCharacter = activeCharacter;
    this.isUsingMobileControls = true;
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      if (this.uiManager.gameOverPopup?.active) { this.goToMenu(); return; }
      if (!this.gameOver) { this.uiManager.togglePause(); return; }
      this.goToMenu(); return;
    }

    if (this.keys.R.isDown) {
      this.scene.restart({ level: this.currentLevel }); return;
    }

    if (this.gameOver) return;
    if (this.uiManager.pausePopup?.active) return;

    const keyboardFire = {
      left: this.keys.A.isDown,
      right: this.keys.D.isDown,
      jump: this.keys.W.isDown,
    };
    const keyboardWater = {
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
      jump: this.cursors.up.isDown,
    };

    let fireControls = keyboardFire;
    let waterControls = keyboardWater;

    if (this.isUsingMobileControls) {
      if (this.activeMobileCharacter === "fire") {
        fireControls = this.mobileControls;
      } else {
        waterControls = this.mobileControls;
      }
    }

    this.movePlayer(this.fireboy, fireControls);
    this.movePlayer(this.watergirl, waterControls);

    this.updateGoalState();

    const t = this.time.now / 300;
    if ((this.fireboy.body as Phaser.Physics.Arcade.Body).blocked.down &&
        !fireControls.left && !fireControls.right) {
      this.fireboy.y += Math.sin(t) * 0.3;
    }
    if ((this.watergirl.body as Phaser.Physics.Arcade.Body).blocked.down &&
        !waterControls.left && !waterControls.right) {
      this.watergirl.y += Math.sin(t + 1) * 0.3;
    }
  }

  private movePlayer(
    player: Phaser.Physics.Arcade.Sprite,
    actions: { left: boolean; right: boolean; jump: boolean }
  ) {
    const speed = 200;
    const jumpPower = 400;
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