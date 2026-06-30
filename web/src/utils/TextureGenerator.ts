import Phaser from "phaser";

export class TextureGenerator {
  static generateAll(scene: Phaser.Scene) {
    const g = scene.add.graphics();

    // ── FIREBOY (28×36) ──────────────────────────────────────────────────
    g.fillStyle(0xdd3311, 1);
    g.fillRect(5, 12, 18, 18);
    g.fillStyle(0xaa2200, 1);
    g.fillRect(5, 28, 7, 8);
    g.fillRect(16, 28, 7, 8);
    g.fillStyle(0xdd3311, 1);
    g.fillRect(1, 14, 5, 10);
    g.fillRect(22, 14, 5, 10);
    g.fillStyle(0xff6644, 1);
    g.fillCircle(14, 8, 9);
    g.fillStyle(0xffcc00, 1);
    g.fillTriangle(6, 5, 10, -3, 13, 4);
    g.fillTriangle(12, 2, 15, -6, 18, 2);
    g.fillTriangle(17, 4, 21, -2, 24, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(9, 7, 3);
    g.fillCircle(19, 7, 3);
    g.fillStyle(0x000000, 1);
    g.fillCircle(10, 7, 1.5);
    g.fillCircle(20, 7, 1.5);
    g.fillStyle(0xffffff, 1);
    g.fillRect(9, 5, 1.5, 1.5);
    g.fillRect(19, 5, 1.5, 1.5);
    g.generateTexture("fireboy", 28, 36);
    g.clear();

    // ── WATERGIRL (28×36) ────────────────────────────────────────────────
    g.fillStyle(0x2288cc, 1);
    g.fillRect(5, 12, 18, 18);
    g.fillStyle(0x1166aa, 1);
    g.fillTriangle(4, 28, 14, 22, 24, 28);
    g.fillRect(6, 28, 7, 8);
    g.fillRect(15, 28, 7, 8);
    g.fillStyle(0x2288cc, 1);
    g.fillRect(1, 14, 5, 10);
    g.fillRect(22, 14, 5, 10);
    g.fillStyle(0x55bbee, 1);
    g.fillCircle(14, 8, 9);
    g.fillStyle(0x88ddff, 1);
    g.fillTriangle(8, 0, 14, 10, 20, 0);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(9, 7, 3);
    g.fillCircle(19, 7, 3);
    g.fillStyle(0x004488, 1);
    g.fillCircle(10, 7, 1.5);
    g.fillCircle(20, 7, 1.5);
    g.fillStyle(0xffffff, 1);
    g.fillRect(9, 5, 1.5, 1.5);
    g.fillRect(19, 5, 1.5, 1.5);
    g.generateTexture("watergirl", 28, 36);
    g.clear();

    // ── PLATFORM (200×16) ────────────────────────────────────────────────
    g.fillStyle(0x5a6a78, 1);
    g.fillRect(0, 0, 200, 16);
    g.fillStyle(0x6b7d8c, 1);
    g.fillRect(2, 2, 196, 6);
    g.fillStyle(0x4a5a68, 1);
    g.fillRect(0, 12, 200, 4);
    g.lineStyle(1, 0x3d4f5c, 0.5);
    for (let x = 40; x < 200; x += 40) g.lineBetween(x, 0, x, 16);
    g.generateTexture("platform", 200, 16);
    g.clear();

    // ── WATER HAZARD (200×10) ────────────────────────────────────────────
    g.fillStyle(0x1155cc, 0.92);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0x3388ff, 0.65);
    g.fillRect(0, 0, 200, 4);
    g.fillStyle(0x88ccff, 0.45);
    for (let x = 10; x < 200; x += 28) g.fillEllipse(x, 3, 14, 4);
    g.generateTexture("waterBlock", 200, 10);
    g.clear();

    // ── LAVA HAZARD (200×10) ─────────────────────────────────────────────
    g.fillStyle(0xcc2200, 0.92);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0xff6600, 0.7);
    g.fillRect(0, 0, 200, 4);
    g.fillStyle(0xffcc00, 0.55);
    for (let x = 14; x < 200; x += 32) g.fillEllipse(x, 3, 16, 5);
    g.generateTexture("lavaBlock", 200, 10);
    g.clear();

    // ── GOAL FIRE DOOR (60×80) ───────────────────────────────────────────
    g.fillStyle(0x442200, 1);
    g.fillRect(0, 0, 60, 80);
    g.fillStyle(0xff6600, 0.35);
    g.fillRect(3, 3, 54, 74);
    g.lineStyle(2.5, 0xff8800, 1);
    g.strokeRect(0, 0, 60, 80);
    g.fillStyle(0xffcc00, 0.8);
    g.fillTriangle(10, 74, 18, 44, 26, 68);
    g.fillTriangle(22, 74, 30, 32, 38, 62);
    g.fillTriangle(33, 74, 41, 48, 49, 74);
    g.fillStyle(0xffffff, 0.6);
    g.fillTriangle(16, 68, 22, 50, 28, 64);
    g.generateTexture("goalFire", 60, 80);
    g.clear();

    // ── GOAL WATER DOOR (60×80) ──────────────────────────────────────────
    g.fillStyle(0x002244, 1);
    g.fillRect(0, 0, 60, 80);
    g.fillStyle(0x0044aa, 0.35);
    g.fillRect(3, 3, 54, 74);
    g.lineStyle(2.5, 0x0088ff, 1);
    g.strokeRect(0, 0, 60, 80);
    g.fillStyle(0x55aaff, 0.7);
    g.fillTriangle(16, 18, 30, 52, 44, 18);
    g.fillStyle(0x88ddff, 0.5);
    g.fillTriangle(21, 24, 30, 46, 39, 24);
    g.fillStyle(0x3399ff, 0.5);
    g.fillEllipse(30, 62, 26, 14);
    g.generateTexture("goalWater", 60, 80);
    g.clear();

    // ── GEM (24×22) ──────────────────────────────────────────────────────
    g.fillStyle(0xffee22, 1);
    g.fillTriangle(7, 4, 12, 1, 17, 4);
    g.fillRect(2, 4, 20, 10);
    g.fillTriangle(2, 14, 12, 26, 22, 14);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(8, 4, 12, 2, 16, 4);
    g.fillTriangle(8, 4, 8, 14, 12, 9);
    g.generateTexture("gem", 24, 26);
    g.clear();

    g.destroy();
  }
}
