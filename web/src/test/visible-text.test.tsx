import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { GAME_TITLE } from "../branding";

// jsdom has no canvas, so Phaser cannot boot. Stub just enough for the React shell to render.
vi.mock("phaser", () => {
  class Stub {}
  class Game {
    events = { on() {}, off() {} };
    scene = { getScene() { return undefined; } };
    scale = { resize() {} };
    destroy() {}
  }
  const Phaser = { Scene: Stub, Game, AUTO: 0, Scale: { NONE: 0, CENTER_BOTH: 0 } };
  return { default: Phaser, ...Phaser };
});

// Phaser draws the menu and HUD onto a canvas, so the render checks only see DOM text
// (topbar, shell). Canvas text is covered by using GAME_TITLE in MenuScene.
const FORBIDDEN = [/fireboy/i, /watergirl/i, /lavaman and icegirl/i, /fire & water/i];

const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

afterEach(() => {
  cleanup();
});

describe("visible text", () => {
  it("shows the Fire & Ice Duo title in the rendered app", () => {
    const { container } = render(<App />);
    expect(GAME_TITLE).toBe("Fire & Ice Duo");
    expect(container.textContent).toContain("Fire & Ice Duo");
  });

  it("does not show old character or game names in the rendered output", () => {
    const { container } = render(<App />);
    const text = container.textContent ?? "";
    for (const pattern of FORBIDDEN) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("uses the new title and description in index.html", () => {
    // Only the visible head metadata is checked. The analytics URL keeps the slug on purpose.
    const title = indexHtml.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const description = indexHtml.match(/<meta name="description" content="(.*?)"/)?.[1] ?? "";
    expect(title).toBe("Fire &amp; Ice Duo — FreeGameStore");
    expect(description).toContain("Fire &amp; Ice Duo");
    for (const pattern of FORBIDDEN) {
      expect(title).not.toMatch(pattern);
      expect(description).not.toMatch(pattern);
    }
    expect(title).not.toMatch(/lavaman-and-icegirl/i);
  });
});
