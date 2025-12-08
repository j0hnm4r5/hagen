export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat", // New feature
				"fix", // Bug fix
				"docs", // Documentation
				"style", // Formatting
				"refactor", // Code refactoring
				"perf", // Performance
				"test", // Tests
				"build", // Build system
				"ci", // CI configuration
				"chore", // Other changes
				"revert", // Revert commit
			],
		],
		"subject-case": [2, "never", ["upper-case"]],
		"subject-empty": [2, "never"],
		"type-empty": [2, "never"],
	},
};
