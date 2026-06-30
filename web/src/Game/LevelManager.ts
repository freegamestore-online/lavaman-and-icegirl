import Phaser from "phaser";
import { levelDefs, resolveLevel, ResolvedLevel } from "../levels";

export class LevelManager {
  private scene: Phaser.Scene;
  private currentLevel: number;
  public platforms!: Phaser.Physics.Arcade.StaticGroup;
  public hazards!: Phaser.Physics.Arcade.StaticGroup;
  public goals!: Phaser.Physics.Arcade.StaticGroup;
  public gems!: Phaser.Physics.Arcade.StaticGroup;
  public fireStart!: { x: number; y: number };
  public waterStart!: { x: number; y: number };
  private resolvedLevel!: ResolvedLevel;

  constructor(scene: Phaser.Scene, level: number) {
    this.scene = scene;
    this.currentLevel = level;
  }

  createLevel() {
    const def = levelDefs[this.currentLevel] ?? levelDefs[0]!;
    this.resolvedLevel = resolveLevel(def);

    this.fireStart = this.resolvedLevel.fireStart;
    this.waterStart = this.resolvedLevel.waterStart;

    this.platforms = this.scene.physics.add.staticGroup();
    this.hazards = this.scene.physics.add.staticGroup();
    this.goals = this.scene.physics.add.staticGroup();
    this.gems = this.scene.physics.add.staticGroup();

    this.resolvedLevel.platforms.forEach((p) => {
      const b = this.platforms.create(p.x, p.y, "platform") as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(p.width, p.height).setOrigin(0.5).refreshBody();
    });

    this.resolvedLevel.hazards.forEach((h) => {
      const tex = h.type === "water" ? "waterBlock" : "lavaBlock";
      const b = this.hazards.create(h.x, h.y, tex) as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(h.width, h.height).setOrigin(0.5).refreshBody();
      b.setData("type", h.type);

      // Subtle glow beneath hazard
      const glow = this.scene.add.graphics();
      glow.fillStyle(h.type === "water" ? 0x1155cc : 0xcc2200, 0.12);
      glow.fillRect(h.x - h.width / 2, h.y - h.height / 2 - 3, h.width, h.height + 6);
    });

    this.resolvedLevel.goals.forEach((gl) => {
      const tex = gl.type === "fire" ? "goalFire" : "goalWater";
      const b = this.goals.create(gl.x, gl.y, tex) as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(gl.width, gl.height).setOrigin(0.5).refreshBody();
      b.setData("type", gl.type);
    });

    this.resolvedLevel.gems.forEach((gm) => {
      const b = this.gems.create(gm.x, gm.y, "gem") as Phaser.Physics.Arcade.Image;
      b.setDisplaySize(18, 17).setOrigin(0.5).refreshBody();
      b.setData("collected", false);
    });

    return this.resolvedLevel;
  }

  getCurrentLevelData(): ResolvedLevel {
    return this.resolvedLevel;
  }

  hasNextLevel(): boolean {
    return this.currentLevel + 1 < levelDefs.length;
  }

  getNextLevel(): number {
    return this.currentLevel + 1;
  }
}
