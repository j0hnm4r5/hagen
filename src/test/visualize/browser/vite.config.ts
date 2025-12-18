import { defineConfig } from "vite";

export default defineConfig({
	root: "src/test/visualize/browser",
	server: {
		port: 5174, // Use different port to avoid conflict with docs:dev (5173)
		open: true,
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
});
