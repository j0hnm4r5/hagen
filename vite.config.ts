import { defineConfig } from "vite";

export default defineConfig({
	root: "src/test",
	server: {
		open: true,
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
});
