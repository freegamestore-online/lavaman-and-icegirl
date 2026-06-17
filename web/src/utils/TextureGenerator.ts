import Phaser from "phaser";

export class TextureGenerator {
  static generateAll(scene: Phaser.Scene) {
    const g = scene.add.graphics();

    // --- FIREBOY ---
    g.fillStyle(0xdd3311, 1);
    g.fillRect(8, 16, 24, 24);
    g.fillStyle(0xaa2200, 1);
    g.fillRect(8, 38, 10, 10);
    g.fillRect(22, 38, 10, 10);
    g.fillStyle(0xdd3311, 1);
    g.fillRect(2, 18, 8, 14);
    g.fillRect(30, 18, 8, 14);
    g.fillStyle(0xff6644, 1);
    g.fillCircle(20, 12, 12);
    g.fillStyle(0xffcc00, 1);
    g.fillTriangle(10, 8, 14, -4, 18, 6);
    g.fillTriangle(17, 4, 21, -8, 25, 2);
    g.fillTriangle(23, 6, 27, -2, 31, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 10, 4);
    g.fillCircle(26, 10, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(15, 10, 2);
    g.fillCircle(27, 10, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 8, 2, 2);
    g.fillRect(26, 8, 2, 2);
    g.fillStyle(0xff9966, 1);
    g.fillRect(14, 17, 12, 3);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(18, 17, 4, 3);
    g.generateTexture("fireboy", 40, 50);
    g.clear();

    // --- WATERGIRL ---
    g.fillStyle(0x2288cc, 1);
    g.fillRect(8, 16, 24, 24);
    g.fillStyle(0x1166aa, 1);
    g.fillTriangle(6, 38, 20, 30, 34, 38);
    g.fillRect(9, 38, 9, 10);
    g.fillRect(22, 38, 9, 10);
    g.fillStyle(0x2288cc, 1);
    g.fillRect(2, 18, 8, 14);
    g.fillRect(30, 18, 8, 14);
    g.fillStyle(0x55bbee, 1);
    g.fillCircle(20, 12, 12);
    g.fillStyle(0x88ddff, 1);
    g.fillTriangle(12, 0, 20, 14, 28, 0);
    g.fillStyle(0x55bbee, 1);
    g.fillCircle(12, 2, 4);
    g.fillCircle(28, 2, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 10, 4);
    g.fillCircle(26, 10, 4);
    g.fillStyle(0x004488, 1);
    g.fillCircle(15, 10, 2);
    g.fillCircle(27, 10, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(14, 8, 2, 2);
    g.fillRect(26, 8, 2, 2);
    g.fillStyle(0x99eeff, 1);
    g.fillRect(14, 17, 12, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(17, 17, 6, 3);
    g.generateTexture("watergirl", 40, 50);
    g.clear();

    // Platform
    g.fillStyle(0x5a6a78, 1);
    g.fillRect(0, 0, 200, 24);
    g.fillStyle(0x6b7d8c, 1);
    g.fillRect(2, 2, 196, 10);
    g.fillStyle(0x4a5a68, 1);
    g.fillRect(0, 18, 200, 6);
    g.lineStyle(1, 0x3d4f5c, 0.6);
    for (let x = 40; x < 200; x += 40) g.lineBetween(x, 0, x, 24);
    g.generateTexture("platform", 200, 24);
    g.clear();

    // Water hazard
    g.fillStyle(0x1155cc, 0.9);
    g.fillRect(0, 0, 200, 40);
    g.fillStyle(0x3388ff, 0.6);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0x88ccff, 0.4);
    for (let x = 10; x < 200; x += 30) g.fillEllipse(x, 6, 18, 6);
    g.generateTexture("waterBlock", 200, 40);
    g.clear();

    // Lava hazard
    g.fillStyle(0xcc2200, 0.9);
    g.fillRect(0, 0, 200, 40);
    g.fillStyle(0xff6600, 0.7);
    g.fillRect(0, 0, 200, 10);
    g.fillStyle(0xffcc00, 0.5);
    for (let x = 15; x < 200; x += 35) g.fillEllipse(x, 6, 20, 7);
    g.generateTexture("lavaBlock", 200, 40);
    g.clear();

    // Goal fire door
    g.fillStyle(0x442200, 1);
    g.fillRect(0, 0, 64, 80);
    g.fillStyle(0xff6600, 0.4);
    g.fillRect(4, 4, 56, 72);
    g.lineStyle(3, 0xff8800, 1);
    g.strokeRect(0, 0, 64, 80);
    g.fillStyle(0xffcc00, 0.8);
    g.fillTriangle(14, 72, 22, 40, 30, 66);
    g.fillTriangle(24, 72, 32, 30, 40, 60);
    g.fillTriangle(34, 72, 42, 46, 50, 72);
    g.fillStyle(0xffffff, 0.7);
    g.fillTriangle(20, 66, 26, 48, 32, 62);
    g.generateTexture("goalFire", 64, 80);
    g.clear();

    // Goal water door
    g.fillStyle(0x002244, 1);
    g.fillRect(0, 0, 64, 80);
    g.fillStyle(0x0044aa, 0.4);
    g.fillRect(4, 4, 56, 72);
    g.lineStyle(3, 0x0088ff, 1);
    g.strokeRect(0, 0, 64, 80);
    g.fillStyle(0x55aaff, 0.7);
    g.fillTriangle(20, 20, 32, 55, 44, 20);
    g.fillStyle(0x88ddff, 0.5);
    g.fillTriangle(25, 26, 32, 48, 39, 26);
    g.fillStyle(0x3399ff, 0.5);
    g.fillEllipse(32, 60, 28, 16);
    g.generateTexture("goalWater", 64, 80);
    g.clear();

    // Gem
    g.fillStyle(0xffee22, 1);
    g.fillTriangle(12, 6, 20, 2, 28, 6);
    g.fillRect(4, 6, 32, 14);
    g.fillTriangle(4, 20, 20, 36, 36, 20);
    g.fillStyle(0xffffff, 0.5);
    g.fillTriangle(14, 6, 20, 4, 26, 6);
    g.fillTriangle(14, 6, 14, 20, 20, 13);
    g.generateTexture("gem", 40, 38);
    g.clear();

    g.destroy();
  }
}