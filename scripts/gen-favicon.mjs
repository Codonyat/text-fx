// Generate raster icons from app/icon.svg: favicon.ico + apple-icon + manifest PNGs.
// Run: node scripts/gen-favicon.mjs
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = await readFile("app/icon.svg");

async function png(size, out) {
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}

await png(180, "app/apple-icon.png");
await png(192, "public/icon-192.png");
await png(512, "public/icon-512.png");

const icoSizes = [16, 32, 48];
const bufs = await Promise.all(
  icoSizes.map((s) => sharp(svg, { density: 512 }).resize(s, s).png().toBuffer()),
);
await writeFile("app/favicon.ico", await pngToIco(bufs));
console.log("wrote app/favicon.ico");
