import Phaser from "phaser";

type HazardHandler = (player: "fire" | "water", hazardType: string) => void;
type GoalHandler = (player: "fire" | "water", goalType: string) => void;
type GemHandler = (gem: Phaser.GameObjects.GameObject) => void;

export class CollisionManager {
  private scene: Phaser.Scene;
  private fireboy: Phaser.Physics.Arcade.Sprite;
  private watergirl: Phaser.Physics.Arcade.Sprite;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private hazards: Phaser.Physics.Arcade.StaticGroup;
  private goals: Phaser.Physics.Arcade.StaticGroup;
  private gems: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    scene: Phaser.Scene,
    fireboy: Phaser.Physics.Arcade.Sprite,
    watergirl: Phaser.Physics.Arcade.Sprite,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    hazards: Phaser.Physics.Arcade.StaticGroup,
    goals: Phaser.Physics.Arcade.StaticGroup,
    gems: Phaser.Physics.Arcade.StaticGroup
  ) {
    this.scene = scene;
    this.fireboy = fireboy;
    this.watergirl = watergirl;
    this.platforms = platforms;
    this.hazards = hazards;
    this.goals = goals;
    this.gems = gems;
  }

  setup(
    onHazard: HazardHandler,
    onGoal: GoalHandler,
    onGem: GemHandler
  ) {
    this.scene.physics.add.collider(this.fireboy, this.platforms);
    this.scene.physics.add.collider(this.watergirl, this.platforms);

    this.scene.physics.add.overlap(this.fireboy, this.hazards, (_, hz) => {
      onHazard("fire", (hz as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.scene.physics.add.overlap(this.watergirl, this.hazards, (_, hz) => {
      onHazard("water", (hz as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.scene.physics.add.overlap(this.fireboy, this.goals, (_, gl) => {
      onGoal("fire", (gl as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.scene.physics.add.overlap(this.watergirl, this.goals, (_, gl) => {
      onGoal("water", (gl as Phaser.GameObjects.GameObject).getData("type") as string);
    });
    this.scene.physics.add.overlap(this.fireboy, this.gems, (_, gm) => {
      onGem(gm as Phaser.GameObjects.GameObject);
    });
    this.scene.physics.add.overlap(this.watergirl, this.gems, (_, gm) => {
      onGem(gm as Phaser.GameObjects.GameObject);
    });
  }
}