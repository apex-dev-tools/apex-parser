import { readdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

async function copyDts(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await copyDts(fullPath);
    } else if (entry.name.endsWith(".d.ts")) {
      const ctsPath = fullPath.replace(/\.d\.ts$/, ".d.cts");
      await copyFile(fullPath, ctsPath);
    }
  }
}

await copyDts("dist/types");
