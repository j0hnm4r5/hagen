import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedDocsDir = path.join(__dirname, "../docs-generated");

// Delete entire docs-generated directory
if (fs.existsSync(generatedDocsDir)) {
	fs.rmSync(generatedDocsDir, { recursive: true, force: true });
	console.log("✓ Cleaned docs-generated directory");
} else {
	console.log("✓ Generated docs directory does not exist (nothing to clean)");
}
