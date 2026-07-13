/**
 * Detect transparent hole bounding boxes in overlay PNGs.
 * Outputs percent coords for overlaySlots.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const DIR = path.resolve("public/frames/overlays");
const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".png") && !f.includes("thumb"));

for (const file of files) {
  const fp = path.join(DIR, file);
  const { data, info } = await sharp(fp)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Find all near-transparent pixels (holes)
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const a = data[i * channels + 3];
    // transparent-ish = hole
    mask[i] = a < 40 ? 1 : 0;
  }

  // Connected components (simple flood fill for large regions)
  const visited = new Uint8Array(width * height);
  const boxes = [];

  function flood(sx, sy) {
    let minX = sx,
      maxX = sx,
      minY = sy,
      maxY = sy,
      count = 0;
    const stack = [[sx, sy]];
    visited[sy * width + sx] = 1;
    while (stack.length) {
      const [x, y] = stack.pop();
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || !mask[ni]) continue;
        visited[ni] = 1;
        stack.push([nx, ny]);
      }
    }
    return { minX, maxX, minY, maxY, count };
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i] || visited[i]) continue;
      const box = flood(x, y);
      // ignore tiny noise (need decent photo hole size)
      if (box.count < width * height * 0.01) continue;
      boxes.push(box);
    }
  }

  // sort top to bottom
  boxes.sort((a, b) => a.minY - b.minY);

  const slots = boxes.map((b) => {
    // expand slightly inward from border of hole for better fill
    const pad = 2;
    const x = Math.max(0, b.minX - pad);
    const y = Math.max(0, b.minY - pad);
    const w = Math.min(width, b.maxX + pad) - x;
    const h = Math.min(height, b.maxY + pad) - y;
    return {
      x: +((x / width) * 100).toFixed(2),
      y: +((y / height) * 100).toFixed(2),
      w: +((w / width) * 100).toFixed(2),
      h: +((h / height) * 100).toFixed(2),
    };
  });

  console.log("\n//", file, `(${width}x${height}) holes=${slots.length}`);
  console.log(JSON.stringify(slots, null, 2));
}
