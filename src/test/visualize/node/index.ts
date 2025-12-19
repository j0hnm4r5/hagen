import { run, VISUALIZATIONS, type VisualizationName } from "../visualize";

const args = process.argv.slice(2);
const filter = args[0];

// Show help if requested
if (filter === "--help" || filter === "-h") {
	console.log("Usage: npm run visualize:node [filter]");
	console.log("");
	console.log("Filter options:");
	console.log("  all              Run all visualizations (default)");
	console.log("  name1,name2,...  Run specific visualizations");
	console.log("");
	console.log("Available visualizations:");
	const names = Object.keys(VISUALIZATIONS) as VisualizationName[];
	for (const name of names) {
		console.log(`  ${name}`);
	}
	process.exit(0);
}

run(filter || "all");
