import Phaser from "phaser";
import { levels, LevelDefinition } from "../levels";

export class LevelManager {
  private scene: Phaser.Scene;
  private currentLevel: number;
  public platforms!: Phaser.Physics.Arcade.StaticGroup;
  public hazards!: Phaser.Physics.Arcade.StaticGroup;
  public goals!: Phaser.Physics.Arcade.StaticGroup;
  public gems!: Phaser.Physics.Arcade.StaticGroup;
  public fireStart!: { x: number; y: number };
  public waterStart!: { x: number; y: number };

  constructor(scene: Phaser.Scene, level: number) {
    this.scene = scene;
    this.currentLevel = level;
  }

  createLevel() {
    const level = levels[this.currentLevel] ?? levels[0]!;
    this.fireStart = level.fireStart;
    this.waterStart = level.waterStart;

    this.platforms = this.scene.physics.add.staticGroup();
    this.hazards = this.scene.physics.add.staticGroup();
    this.goals = this.scene.physics.add.staticGroup();
    this.gems = this.scene.physics.add.staticGroup();

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

    return level;
  }

  getCurrentLevelData(): LevelDefinition {
    return levels[this.currentLevel] ?? levels[0]!;
  }

  getNextLevel(): number {
    return this.currentLevel + 1;
  }

  hasNextLevel(): boolean {
    return this.currentLevel + 1 < levels.length;
  }
}