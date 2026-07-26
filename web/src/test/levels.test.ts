import { describe, expect, it } from "vitest";
import { COL_COUNT, ROW_COUNT, getGoalH, getGoalW, levelDefs, resolveLevel, setScaleFactor } from "../levels";

describe("goal sizing", () => {
  it("uses smaller goals than the old 2x2-cell doors", () => {
    setScaleFactor(360, 640);

    const oldGoalW = 2 * (360 / COL_COUNT);
    const oldGoalH = 2 * (640 / ROW_COUNT);

    expect(getGoalW()).toBeLessThan(oldGoalW);
    expect(getGoalH()).toBeLessThan(oldGoalH);
    expect(getGoalH()).toBeCloseTo(40, 1);
  });

  it("resolves compact goal geometry for levels", () => {
    setScaleFactor(360, 640);
    const resolved = resolveLevel(levelDefs[0]!);

    const oldGoalW = 2 * (360 / COL_COUNT);
    const oldGoalH = 2 * (640 / ROW_COUNT);

    for (const goal of resolved.goals) {
      expect(goal.width).toBeLessThan(oldGoalW);
      expect(goal.height).toBeLessThan(oldGoalH);
      expect(goal.height).toBeCloseTo(40, 1);
    }
  });
});
