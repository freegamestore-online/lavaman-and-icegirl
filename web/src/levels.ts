/**
 * GRID-BASED LEVEL SYSTEM
 * ========================
 * Canvas: 360 wide × 640 tall (9:16 portrait)
 * These dimensions are the BASE size - they will be scaled
 */

export const COL_COUNT = 12;
export const ROW_COUNT = 10;
 
// Live canvas size — updated whenever Game.tsx resizes the Phaser canvas
let _canvasWidth = 360;
let _canvasHeight = 640;
 
// Reference cell size (matches the original 360x640 portrait design) — used
// only to keep fixed-size visual elements (platform thickness, gem size,
// jump offset) looking consistent rather than stretching with the grid.
const REF_COL_W = 360 / COL_COUNT; // 30
const REF_ROW_H = 640 / ROW_COUNT; // 64
 
export function setScaleFactor(width: number, height: number) {
  _canvasWidth = width;
  _canvasHeight = height;
  console.log(`Canvas set to: ${width}x${height}`);
}
 
export function getCanvasDimensions() {
  return { width: _canvasWidth, height: _canvasHeight };
}
 
function colW() {
  return _canvasWidth / COL_COUNT;
}
 
function rowH() {
  return _canvasHeight / ROW_COUNT;
}
 
// Uniform scale for elements that shouldn't stretch with aspect ratio changes
function getUniformScale() {
  return Math.min(colW() / REF_COL_W, rowH() / REF_ROW_H);
}
 
// Kept for backwards compatibility with any external callers
export function getScaleFactor() {
  return getUniformScale();
}
 
// Helper functions — grid coordinates resolve directly off live canvas size
export const colX = (col: number) => (col - 0.5) * colW();
export const rowY = (row: number) => row * rowH();
export const colLeft = (col: number) => (col - 1) * colW();
 
// Constants that depend on scale
export function getPlatformH() { return 16 * getUniformScale(); }
export function getHazardH() { return 10 * getUniformScale(); }
export function getGoalW() { return 2 * colW(); }
export function getGoalH() { return 2 * rowH(); }
export function getGemSize() { return 22 * getUniformScale(); }
 
// Types
export type BlockDef = {
  id: string;
  col: number;
  row: number;
  span: number;
};
 
export type HazardDef = {
  blockId: string;
  type: "water" | "lava";
  fromCol: number;
  toCol: number;
};
 
export type GoalDef = {
  col: number;
  row: number;
  type: "fire" | "water";
};
 
export type GemDef = {
  col: number;
  row: number;
};
 
export type PlayerStart = {
  col: number;
  row: number;
};
 
export type LevelDefinition = {
  title: string;
  fireStart: PlayerStart;
  waterStart: PlayerStart;
  blocks: BlockDef[];
  hazards: HazardDef[];
  goals: GoalDef[];
  gems: GemDef[];
};
 
export type ResolvedBlock = { x: number; y: number; width: number; height: number };
export type ResolvedHazard = ResolvedBlock & { type: "water" | "lava" };
export type ResolvedGoal = ResolvedBlock & { type: "fire" | "water" };
export type ResolvedGem = { x: number; y: number };
export type ResolvedLevel = {
  title: string;
  fireStart: { x: number; y: number };
  waterStart: { x: number; y: number };
  platforms: ResolvedBlock[];
  hazards: ResolvedHazard[];
  goals: ResolvedGoal[];
  gems: ResolvedGem[];
};
 
export function resolveLevel(def: LevelDefinition): ResolvedLevel {
  const cw = colW();
  const rh = rowH();
  const platformH = getPlatformH();
  const hazardH = getHazardH();
  const goalW = 2 * cw;
  const goalH = 2 * rh;
  const uScale = getUniformScale();
 
  const blockMap = new Map<string, BlockDef>();
  def.blocks.forEach(b => blockMap.set(b.id, b));
 
  const platforms: ResolvedBlock[] = def.blocks.map(b => ({
    x: colLeft(b.col) + (b.span * cw) / 2,
    y: rowY(b.row),
    width: b.span * cw,
    height: platformH,
  }));
 
  const hazards: ResolvedHazard[] = def.hazards.map(h => {
    const block = blockMap.get(h.blockId);
    if (!block) throw new Error(`Unknown block id "${h.blockId}"`);
    const blockLeft = colLeft(block.col);
    const hLeft = blockLeft + (h.fromCol - 1) * cw;
    const hRight = blockLeft + h.toCol * cw;
    const hWidth = hRight - hLeft;
    return {
      x: hLeft + hWidth / 2,
      y: rowY(block.row) - hazardH / 2,
      width: hWidth,
      height: hazardH,
      type: h.type,
    };
  });
 
  const goals: ResolvedGoal[] = def.goals.map(gl => ({
    x: colLeft(gl.col) + goalW / 2,
    y: rowY(gl.row) - goalH / 2,
    width: goalW,
    height: goalH,
    type: gl.type,
  }));
 
  const gems: ResolvedGem[] = def.gems.map(gm => ({
    x: colX(gm.col),
    y: rowY(gm.row) - rh / 2,
  }));
 
  const fireStart = {
    x: colX(def.fireStart.col),
    y: rowY(def.fireStart.row) - 30 * uScale,
  };
  const waterStart = {
    x: colX(def.waterStart.col),
    y: rowY(def.waterStart.row) - 30 * uScale,
  };
 
  return { title: def.title, fireStart, waterStart, platforms, hazards, goals, gems };
}
 
// Level definitions using grid-based system
export const levelDefs: LevelDefinition[] = [
  {
    title: "Level 1: Forest Run",
    fireStart: { col: 2.5, row: 8.5 }, // ~ x:200, y:520
    waterStart: { col: 9.5, row: 4.5 }, // ~ x:760, y:260
    blocks: [
      // Ground
      { id: "ground", col: 1, row: 9.5, span: 12 },
      // Platforms
      { id: "p1", col: 3, row: 7.5, span: 3.5 },
      { id: "p2", col: 6, row: 6.5, span: 1.75 },
      { id: "p3", col: 8, row: 5.5, span: 3.5 },
      { id: "p4", col: 7, row: 4.5, span: 1.25 },
      { id: "p5", col: 5, row: 3.5, span: 2.75 },
    ],
    hazards: [
      { blockId: "p1", type: "water", fromCol: 3, toCol: 4 },
      { blockId: "p3", type: "lava", fromCol: 8, toCol: 9 },
    ],
    goals: [
      { col: 1.5, row: 8, type: "fire" },
      { col: 10.5, row: 4, type: "water" },
    ],
    gems: [
      { col: 5.5, row: 6 },
      { col: 7, row: 4 },
      { col: 6, row: 3 },
    ],
  },
  {
    title: "Level 2: Crystal Cavern",
    fireStart: { col: 10, row: 9.5 },
    waterStart: { col: 9.5, row: 9.5 },
    blocks: [
      { id: "ground", col: 1, row: 9.5, span: 12 },
      { id: "p1", col: 2, row: 7.5, span: 2.75 },
      { id: "p2", col: 5.5, row: 6.5, span: 3 },
      { id: "p3", col: 8.5, row: 5.5, span: 3 },
      { id: "p4", col: 6, row: 4.5, span: 2.5 },
      { id: "p5", col: 2.5, row: 3.5, span: 2 },
      { id: "p6", col: 10.5, row: 3.5, span: 2 },
    ],
    hazards: [
      { blockId: "p1", type: "lava", fromCol: 2, toCol: 3 },
      { blockId: "p3", type: "water", fromCol: 8.5, toCol: 9.5 },
    ],
    goals: [
      { col: 1.5, row: 8, type: "fire" },
      { col: 10.5, row: 2.5, type: "water" },
    ],
    gems: [
      { col: 2, row: 7 },
      { col: 6, row: 5.5 },
      { col: 8.5, row: 4.5 },
      { col: 6, row: 3.5 },
    ],
  },
  {
    title: "Level 3: Lava Bridge",
    fireStart: { col: 1, row: 3.5 },
    waterStart: { col: 11, row: 8.5 },
    blocks: [
      { id: "ground", col: 1, row: 9.5, span: 12 },
      { id: "p1", col: 1, row: 4, span: 2 },
      { id: "p2", col: 3.5, row: 5, span: 2 },
      { id: "p3", col: 6, row: 4, span: 1.5 },
      { id: "p4", col: 8.5, row: 5.5, span: 2 },
      { id: "p5", col: 10.5, row: 6.5, span: 2 },
      { id: "p6", col: 6.5, row: 7.5, span: 2.5 },
      { id: "p7", col: 2.5, row: 8, span: 2 },
    ],
    hazards: [
      { blockId: "ground", type: "lava", fromCol: 6, toCol: 11 },
      { blockId: "p2", type: "water", fromCol: 3.5, toCol: 4.5 },
      { blockId: "p6", type: "lava", fromCol: 6.5, toCol: 7.5 },
    ],
    goals: [
      { col: 11, row: 5, type: "fire" },
      { col: 1.5, row: 2.5, type: "water" },
    ],
    gems: [
      { col: 3.5, row: 4.5 },
      { col: 6, row: 3.5 },
      { col: 8.5, row: 5 },
      { col: 5, row: 6.5 },
      { col: 2.5, row: 7.5 },
    ],
  },
  {
    title: "Level 4: Twin Towers",
    fireStart: { col: 1.5, row: 8.5 },
    waterStart: { col: 10.5, row: 8.5 },
    blocks: [
      { id: "ground", col: 1, row: 9.5, span: 12 },
      // Left tower
      { id: "l1", col: 1.5, row: 8, span: 2 },
      { id: "l2", col: 1.5, row: 6.5, span: 2 },
      { id: "l3", col: 1.5, row: 5, span: 2 },
      { id: "l4", col: 1.5, row: 3.5, span: 2 },
      { id: "l5", col: 1.5, row: 2, span: 2 },
      // Right tower
      { id: "r1", col: 10.5, row: 8, span: 2 },
      { id: "r2", col: 10.5, row: 6.5, span: 2 },
      { id: "r3", col: 10.5, row: 5, span: 2 },
      { id: "r4", col: 10.5, row: 3.5, span: 2 },
      { id: "r5", col: 10.5, row: 2, span: 2 },
      // Middle bridges
      { id: "b1", col: 6, row: 7, span: 2.75 },
      { id: "b2", col: 6, row: 4.5, span: 2.75 },
    ],
    hazards: [
      { blockId: "ground", type: "water", fromCol: 4, toCol: 7 },
      { blockId: "ground", type: "lava", fromCol: 8, toCol: 10 },
      { blockId: "b1", type: "lava", fromCol: 6, toCol: 7.5 },
    ],
    goals: [
      { col: 1.5, row: 1.5, type: "fire" },
      { col: 10.5, row: 1.5, type: "water" },
    ],
    gems: [
      { col: 6, row: 6.5 },
      { col: 6, row: 4 },
      { col: 1.5, row: 4.5 },
      { col: 10.5, row: 3.5 },
      { col: 4, row: 8.5 },
    ],
  },
  {
    title: "Level 5: The Summit",
    fireStart: { col: 1, row: 8.5 },
    waterStart: { col: 11, row: 8.5 },
    blocks: [
      { id: "ground", col: 1, row: 9.5, span: 12 },
      // Zigzag ascent left side
      { id: "p1", col: 2, row: 8, span: 2.25 },
      { id: "p2", col: 4.5, row: 7, span: 2 },
      { id: "p3", col: 2.5, row: 6, span: 2.5 },
      { id: "p4", col: 5, row: 5, span: 2 },
      { id: "p5", col: 2.5, row: 4, span: 2.75 },
      // Zigzag ascent right side
      { id: "p6", col: 9.5, row: 8, span: 2.25 },
      { id: "p7", col: 7.5, row: 7, span: 2 },
      { id: "p8", col: 9.5, row: 6, span: 2.5 },
      { id: "p9", col: 7.5, row: 5, span: 2 },
      { id: "p10", col: 9.5, row: 4, span: 2.75 },
      // Summit center
      { id: "p11", col: 6, row: 3.5, span: 3 },
      { id: "p12", col: 5, row: 2.5, span: 2.5 },
      { id: "p13", col: 7.5, row: 2.5, span: 2.5 },
      { id: "p14", col: 6, row: 1.5, span: 3.75 },
    ],
    hazards: [
      { blockId: "ground", type: "lava", fromCol: 6, toCol: 8 },
      { blockId: "p1", type: "water", fromCol: 2, toCol: 3 },
      { blockId: "p6", type: "lava", fromCol: 9.5, toCol: 10.5 },
      { blockId: "p2", type: "water", fromCol: 4.5, toCol: 5.5 },
      { blockId: "p7", type: "lava", fromCol: 7.5, toCol: 8.5 },
      { blockId: "p4", type: "water", fromCol: 5, toCol: 6 },
      { blockId: "p9", type: "lava", fromCol: 7.5, toCol: 8.5 },
      { blockId: "p11", type: "water", fromCol: 6, toCol: 6.5 },
    ],
    goals: [
      { col: 1, row: 2.5, type: "fire" },
      { col: 11, row: 2.5, type: "water" },
    ],
    gems: [
      { col: 3, row: 4.5 },
      { col: 9, row: 4.5 },
      { col: 4.5, row: 6.5 },
      { col: 7.5, row: 6.5 },
      { col: 6, row: 2.5 },
      { col: 6, row: 1 },
    ],
  },
];