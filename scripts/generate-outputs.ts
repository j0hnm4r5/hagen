import { glob } from "glob";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const generatedDocsDir = path.join(projectRoot, "docs-generated");

// Step 1: Clean and recreate docs-generated directory
console.log("🧹 Cleaning generated docs directory...");
if (fs.existsSync(generatedDocsDir)) {
	fs.rmSync(generatedDocsDir, { recursive: true, force: true });
	console.log("✓ Cleaned docs-generated directory");
}

// Step 2: Copy docs to docs-generated
console.log("\n📋 Copying docs to docs-generated...");
fs.cpSync(path.join(projectRoot, "docs"), generatedDocsDir, { recursive: true });
console.log("✓ Copied all documentation files");

// Step 3: Create outputs directory in public (will be copied to dist by VitePress)
const outputsDir = path.join(generatedDocsDir, "public/outputs");
fs.mkdirSync(outputsDir, { recursive: true });
console.log("✓ Created outputs directory");

// Step 4: Find all markdown files in generated directory
console.log("\n📁 Finding markdown files...");
const mdFiles = glob.sync("**/*.md", {
	cwd: generatedDocsDir,
	ignore: ["**/node_modules/**", "**/dist/**", "**/api/**"],
	absolute: true,
});

console.log(`Found ${mdFiles.length} markdown files\n`);

// Step 5: Process each file
let processedCount = 0;
let totalBlocks = 0;

for (let i = 0; i < mdFiles.length; i++) {
	const mdFile = mdFiles[i];
	const relativePath = path.relative(generatedDocsDir, mdFile);

	console.log(`[${i + 1}/${mdFiles.length}] Processing: ${relativePath}`);

	let content = fs.readFileSync(mdFile, "utf-8");
	let modified = false;
	let blockCount = 0;

	// Step 6: Find code blocks with {output=true}
	const codeBlockRegex = /```typescript \{output=true\}\n([\s\S]*?)\n```/g;

	const newContent = content.replace(codeBlockRegex, (match, code) => {
		blockCount++;
		totalBlocks++;

		// Generate hash from code content
		const hash = crypto.createHash("md5").update(code).digest("hex").slice(0, 8);

		// Create output filename
		const slug = relativePath.replace(/\//g, "-").replace(".md", "");
		const outputFilename = `${slug}-${hash}.ansi`;
		const outputPath = path.join(outputsDir, outputFilename);

		console.log(`  → Executing code block ${blockCount} (${hash})`);

		// Write code to temp file, replacing 'hagen' import with local path
		const tempFile = path.join("/tmp", `hagen-${hash}-${Date.now()}.mjs`); // Use .mjs for ESM
		const distPath = path.join(projectRoot, "dist/index.js");

		// Wrap code to ensure all output is flushed before exit
		// Import both default and named exports from hagen
		const wrappedCode = `import hagen, { createHagen, log, info, success, warn, error } from 'file://${distPath}';

${code.replace(/^import\s+.*?from\s+['"]hagen['"];?\s*$/gm, "")}

// Force flush all console output before exit
await new Promise(resolve => setTimeout(resolve, 500));
`;

		fs.writeFileSync(tempFile, wrappedCode);

		let output: string;
		try {
			// Execute with node and redirect stderr to stdout to maintain output order
			const result = spawnSync("sh", ["-c", `node ${tempFile} 2>&1`], {
				encoding: "utf-8",
				cwd: projectRoot,
				env: { ...process.env, FORCE_COLOR: "1" },
			});

			if (result.error) {
				throw result.error;
			}

			if (result.status !== 0) {
				const error = new Error(`Process exited with code ${result.status}`) as Error & {
					stderr?: string;
					stdout?: string;
				};
				error.stderr = result.stderr;
				error.stdout = result.stdout;
				throw error;
			}

			// Output already combines stdout and stderr in correct order
			output = result.stdout;
		} catch (error) {
			// Cleanup and fail
			try {
				fs.unlinkSync(tempFile);
			} catch {
				// Ignore
			}

			console.error(`\n❌ Failed to execute code in ${relativePath}:`);
			console.error(`Code block #${blockCount} (hash: ${hash})`);
			console.error((error as Error).message);
			if ((error as { stderr?: string }).stderr) {
				console.error("\nStderr:", (error as { stderr: string }).stderr);
			}
			if ((error as { stdout?: string }).stdout) {
				console.error("\nStdout:", (error as { stdout: string }).stdout);
			}
			process.exit(1);
		}

		// Cleanup temp file
		try {
			fs.unlinkSync(tempFile);
		} catch {
			// Ignore
		}

		// Save output to .ansi file
		fs.writeFileSync(outputPath, output);
		console.log(`  ✓ Output saved: ${outputFilename}`);

		// Inject Terminal component with absolute path from site root
		// Files in public/ are served from the root, so /outputs/filename.ansi
		const publicPath = `/outputs/${outputFilename}`;

		modified = true;
		return `${match}\n\n<Terminal src="${publicPath}" />`;
	});

	// Step 7: Write modified markdown back to generated directory
	if (modified) {
		fs.writeFileSync(mdFile, newContent);
		processedCount++;
		console.log(`  ✓ Updated markdown with ${blockCount} output(s)\n`);
	} else {
		console.log(`  - No code blocks to process\n`);
	}
}

// Summary
console.log("━".repeat(50));
console.log(`✅ Generation complete!`);
console.log(`   Files processed: ${processedCount}/${mdFiles.length}`);
console.log(`   Code blocks executed: ${totalBlocks}`);
console.log("━".repeat(50));
