import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Hagen",
	description: "A colorful, instance-based logger for JavaScript and TypeScript",
	base: "/hagen/",

	themeConfig: {
		logo: "/screenshot.png",

		nav: [
			{ text: "Guide", link: "/guide/" },
			{ text: "Examples", link: "/examples/" },
			{ text: "API", link: "/api/" },
			{
				text: "v4.0.0",
				items: [
					{
						text: "Changelog",
						link: "https://github.com/j0hnm4r5/hagen/blob/main/CHANGELOG.md",
					},
					{ text: "Migration Guide", link: "/guide/migration" },
				],
			},
		],

		sidebar: {
			"/guide/": [
				{
					text: "Introduction",
					items: [
						{ text: "Getting Started", link: "/guide/" },
						{ text: "Installation", link: "/guide/installation" },
						{ text: "Quick Start", link: "/guide/quick-start" },
					],
				},
				{
					text: "Core Concepts",
					items: [
						{ text: "Configuration", link: "/guide/configuration" },
						{ text: "Log Levels", link: "/guide/log-levels" },
						{ text: "Custom Colors", link: "/guide/custom-colors" },
						{ text: "Timestamps", link: "/guide/timestamps" },
					],
				},
				{
					text: "Migration",
					items: [{ text: "v3 to v4", link: "/guide/migration" }],
				},
			],

			"/examples/": [
				{
					text: "Examples",
					items: [
						{ text: "Overview", link: "/examples/" },
						{ text: "Basic Usage", link: "/examples/basic-usage" },
						{
							text: "Multiple Loggers",
							link: "/examples/multiple-loggers",
						},
						{ text: "Custom Styling", link: "/examples/custom-styling" },
						{
							text: "CI Environments",
							link: "/examples/ci-environments",
						},
						{ text: "TypeScript", link: "/examples/typescript" },
						{ text: "Browser Usage", link: "/examples/browser-usage" },
					],
				},
			],

			"/api/": [
				{
					text: "API Reference",
					items: [{ text: "Overview", link: "/api/" }],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/j0hnm4r5/hagen" },
			{
				icon: {
					svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>npm</title><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/></svg>',
				},
				link: "https://www.npmjs.com/package/hagen",
			},
		],

		editLink: {
			pattern: "https://github.com/j0hnm4r5/hagen/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2025 John Mars",
		},

		search: {
			provider: "local",
		},
	},

	markdown: {
		theme: {
			light: "github-light",
			dark: "github-dark",
		},
	},
});
