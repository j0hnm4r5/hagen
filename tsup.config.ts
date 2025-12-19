import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		cli: "src/cli.ts",
	},
	format: ["esm"],
	dts: {
		resolve: true,
	},
	clean: true,
	sourcemap: true,
	splitting: false,
	treeshake: true,
	outDir: "dist",
	outExtension() {
		return {
			js: ".mjs",
		};
	},
	target: "es2020",
	platform: "neutral",
	external: ["node:util"],
	noExternal: ["ansis"],
});
