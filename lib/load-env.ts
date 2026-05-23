import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

if (existsSync(resolve(root, ".env.local"))) {
  config({ path: resolve(root, ".env.local") });
} else if (existsSync(resolve(root, ".env"))) {
  config({ path: resolve(root, ".env") });
}
