export type LevelObject = { x: number; y: number; width: number; height: number };
export type HazardObject = LevelObject & { type: "water" | "lava" };
export type GoalObject = LevelObject & { type: "fire" | "water" };
export type GemObject = { x: number; y: number };

export type LevelDefinition = {
  title: string;
  fireStart: { x: number; y: number };
  waterStart: { x: number; y: number };
  platforms: LevelObject[];
  hazards: HazardObject[];
  goals: GoalObject[];
  gems: GemObject[];
};
export const levels: LevelDefinition[] = [
  {
    title: "Level 1: Forest Run",
    fireStart: { x: 120, y: 520 },
    waterStart: { x: 840, y: 260 },
    platforms: [
      { x: 480, y: 620, width: 960, height: 40 },
      { x: 220, y: 490, width: 280, height: 20 },
      { x: 480, y: 430, width: 140, height: 20 },
      { x: 700, y: 380, width: 280, height: 20 },
      { x: 560, y: 320, width: 100, height: 20 },
      { x: 420, y: 260, width: 220, height: 20 },
    ],
    hazards: [
      { x: 360, y: 600, width: 300, height: 40, type: "water" },
      { x: 660, y: 560, width: 280, height: 40, type: "lava" },
    ],
    goals: [
      { x: 90, y: 570, width: 100, height: 80, type: "fire" },
      { x: 860, y: 300, width: 100, height: 80, type: "water" },
    ],
    gems: [
      { x: 420, y: 400 },
      { x: 560, y: 280 },
      { x: 480, y: 210 },
    ],
  },
  {
    title: "Level 2: Crystal Cavern",
    fireStart: { x: 100, y: 520 },
    waterStart: { x: 860, y: 150 },
    platforms: [
      { x: 480, y: 620, width: 960, height: 40 },
      { x: 160, y: 490, width: 220, height: 20 },
      { x: 420, y: 420, width: 240, height: 20 },
      { x: 700, y: 350, width: 240, height: 20 },
      { x: 480, y: 270, width: 200, height: 20 },
      { x: 200, y: 200, width: 160, height: 20 },
      { x: 840, y: 200, width: 160, height: 20 },
    ],
    hazards: [
      { x: 340, y: 590, width: 300, height: 40, type: "lava" },
      { x: 700, y: 540, width: 220, height: 40, type: "water" },
    ],
    goals: [
      { x: 90, y: 560, width: 100, height: 80, type: "fire" },
      { x: 840, y: 130, width: 100, height: 80, type: "water" },
    ],
    gems: [
      { x: 160, y: 450 },
      { x: 480, y: 370 },
      { x: 700, y: 300 },
      { x: 480, y: 220 },
    ],
  },
  {
    title: "Level 3: Lava Bridge",
    fireStart: { x: 60, y: 200 },
    waterStart: { x: 900, y: 560 },
    platforms: [
      { x: 480, y: 620, width: 960, height: 40 },
      { x: 80,  y: 240, width: 160, height: 20 },
      { x: 260, y: 320, width: 160, height: 20 },
      { x: 480, y: 240, width: 120, height: 20 },
      { x: 700, y: 350, width: 160, height: 20 },
      { x: 880, y: 420, width: 160, height: 20 },
      { x: 500, y: 480, width: 200, height: 20 },
      { x: 200, y: 540, width: 160, height: 20 },
    ],
    hazards: [
      { x: 480, y: 600, width: 500, height: 40, type: "lava" },
      { x: 170, y: 390, width: 200, height: 20, type: "water" },
      // { x: 650, y: 540, width: 200, height: 40, type: "lava" },
    ],
    goals: [
      { x: 880, y: 330, width: 100, height: 80, type: "fire" },
      { x: 80,  y: 170, width: 100, height: 80, type: "water" },
    ],
    gems: [
      { x: 260, y: 285 },
      { x: 480, y: 205 },
      { x: 700, y: 285 },
      { x: 380, y: 425 },
      { x: 200, y: 505 },
    ],
  },
  {
    title: "Level 4: Twin Towers",
    fireStart: { x: 80, y: 560 },
    waterStart: { x: 880, y: 560 },
    platforms: [
      { x: 480, y: 620, width: 960, height: 40 },
      // Left tower
      { x: 100, y: 500, width: 160, height: 20 },
      { x: 100, y: 420, width: 160, height: 20 },
      { x: 100, y: 340, width: 160, height: 20 },
      { x: 100, y: 260, width: 160, height: 20 },
      { x: 100, y: 180, width: 160, height: 20 },
      // Right tower
      { x: 860, y: 500, width: 160, height: 20 },
      { x: 860, y: 420, width: 160, height: 20 },
      { x: 860, y: 340, width: 160, height: 20 },
      { x: 860, y: 260, width: 160, height: 20 },
      { x: 860, y: 180, width: 160, height: 20 },
      // Middle bridges
      { x: 480, y: 460, width: 220, height: 20 },
      { x: 480, y: 300, width: 220, height: 20 },
    ],
    hazards: [
      { x: 340, y: 600, width: 250, height: 40, type: "water" },
      { x: 620, y: 600, width: 200, height: 40, type: "lava" },
      { x: 480, y: 530, width: 220, height: 20, type: "lava" },
    ],
    goals: [
      { x: 100, y: 110, width: 100, height: 80, type: "fire" },
      { x: 860, y: 110, width: 100, height: 80, type: "water" },
    ],
    gems: [
      { x: 480, y: 425 },
      { x: 480, y: 265 },
      { x: 100, y: 305 },
      { x: 860, y: 225 },
      { x: 340, y: 560 },
    ],
  },
  {
    title: "Level 5: The Summit",
    fireStart: { x: 60, y: 560 },
    waterStart: { x: 900, y: 560 },
    platforms: [
      { x: 480, y: 620, width: 960, height: 40 },
      // Zigzag ascent left side
      { x: 160, y: 530, width: 200, height: 20 },
      { x: 360, y: 460, width: 160, height: 20 },
      { x: 180, y: 390, width: 180, height: 20 },
      { x: 380, y: 320, width: 160, height: 20 },
      { x: 160, y: 250, width: 200, height: 20 },
      // Zigzag ascent right side
      { x: 800, y: 530, width: 200, height: 20 },
      { x: 600, y: 460, width: 160, height: 20 },
      { x: 780, y: 390, width: 180, height: 20 },
      { x: 580, y: 320, width: 160, height: 20 },
      { x: 800, y: 250, width: 200, height: 20 },
      // Summit center
      { x: 480, y: 180, width: 200, height: 20 },
    ],
    hazards: [
      { x: 480, y: 600, width: 400, height: 40, type: "lava" },
      { x: 270, y: 430, width: 140, height: 20, type: "water" },
      { x: 690, y: 430, width: 140, height: 20, type: "lava" },
      { x: 480, y: 360, width: 120, height: 20, type: "water" },
    ],
    goals: [
      { x: 60,  y: 175, width: 100, height: 80, type: "fire" },
      { x: 900, y: 175, width: 100, height: 80, type: "water" },
    ],
    gems: [
      { x: 360, y: 425 },
      { x: 600, y: 425 },
      { x: 380, y: 285 },
      { x: 580, y: 285 },
      { x: 480, y: 145 },
    ],
  },
  
];


