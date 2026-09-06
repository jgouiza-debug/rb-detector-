/* Render the Pip mark to PNG app icons with sharp (rasterizes SVG directly). Usage: pnpm icons */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const pip = (maskable: boolean) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0%" stop-color="#FFE8A0"/><stop offset="100%" stop-color="#F5B841"/></radialGradient>
    <radialGradient id="body" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#FFE8A0"/><stop offset="60%" stop-color="#FFDE7A"/><stop offset="100%" stop-color="#F5B841"/></radialGradient>
  </defs>
  ${maskable ? '<rect width="120" height="120" fill="#FFDE7A"/><circle cx="60" cy="60" r="62" fill="url(#bg)"/>' : '<rect width="120" height="120" rx="26" fill="#FFF9ED"/>'}
  <path d="M60 34 C60 26 58 20 54 16" stroke="#4F6B47" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M54 16 C48 14 44 17 44 22 C49 23 53 21 54 16 Z" fill="#A9C6A1"/>
  <path d="M58 22 C63 18 68 19 69 24 C65 26 60 25 58 22 Z" fill="#A9C6A1"/>
  <ellipse cx="60" cy="72" rx="40" ry="38" fill="url(#body)"/>
  <ellipse cx="36" cy="82" rx="7" ry="4.5" fill="#F3B7A6" opacity="0.75"/>
  <ellipse cx="84" cy="82" rx="7" ry="4.5" fill="#F3B7A6" opacity="0.75"/>
  <ellipse cx="47" cy="70" rx="5.5" ry="7" fill="#2B2620"/>
  <ellipse cx="73" cy="70" rx="5.5" ry="7" fill="#2B2620"/>
  <circle cx="49" cy="67" r="2" fill="#FFF9ED"/><circle cx="75" cy="67" r="2" fill="#FFF9ED"/>
</svg>`;

async function main() {
  const outDir = path.join(process.cwd(), "public", "icons");
  await fs.mkdir(outDir, { recursive: true });
  const std = Buffer.from(pip(false));
  const mask = Buffer.from(pip(true));
  const jobs: [Buffer, number, string][] = [
    [std, 192, "icon-192.png"],
    [std, 512, "icon-512.png"],
    [mask, 512, "maskable-512.png"],
    [std, 180, "apple-touch-icon.png"],
  ];
  for (const [svg, size, name] of jobs) {
    await sharp(svg).resize(size, size).png().toFile(path.join(outDir, name));
    console.log(`wrote public/icons/${name}`);
  }
  // Also refresh the source SVG for reference.
  await fs.mkdir(path.join(process.cwd(), "public", "pip"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public", "pip", "icon.svg"), pip(false));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
