import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
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
	external: [],
	noExternal: ["ansis", "std-env"],
});
