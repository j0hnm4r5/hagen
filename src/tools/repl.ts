/**
 * Hagen REPL (Read-Eval-Print Loop)
 *
 * This script provides an interactive Node.js REPL environment with Hagen logger
 * automatically imported and available globally. Run it with:
 *
 * ```bash
 * tsx src/tools/repl.ts
 * ```
 *
 * Once the REPL starts, you can use Hagen directly:
 *
 * ```javascript
 * > hagen.log("API", "Hello from Hagen!")
 * > hagen.info("SYSTEM", "Server started on port 3000")
 * > hagen.success("DB", "Connected to database")
 * > hagen.warn("AUTH", "Token expires in 5 minutes")
 * > hagen.error("API", "Request failed", new Error("Connection timeout"))
 * ```
 */

import hagen, { type HagenInstance } from "hagen";
import { start } from "node:repl";
import { inspect } from "node:util";

declare global {
	var hagen: HagenInstance;
}

global.hagen = hagen;

start({
	prompt: "> ",
	useGlobal: true,
	ignoreUndefined: true,
	writer: (output) => inspect(output),
});
