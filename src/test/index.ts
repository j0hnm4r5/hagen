import { Chalk } from "chalk";
import hagen, { createHagen } from "../index";

const customChalk = new Chalk({ level: 3 });

export function test() {
	hagen.log("Test", "This is a normal log message.");
	hagen.info("Information", "This is an info message.");
	hagen.success("Success", "This is a success message.");
	hagen.warn("Warning", "This is a warning message.");
	hagen.error("Error", "This is an error message.");

	hagen.log(
		{ label: "Custom Color", bgColor: "#c0ffee", fgColor: "#bada55" },
		"This message has a custom color."
	);
	hagen.log(
		{ label: "Custom Color", color: customChalk.bgGrey.green },
		"This message has a custom chalk color."
	);

	hagen.log("Multi-line", "This is a message\nwith\nmultiple lines.\n\n\nHere's another line.");

	hagen.log("", "Empty Label");

	hagen.log(
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices ligula porta lobortis blandit. Phasellus blandit felis dolor, id commodo ipsum molestie vel. Pellentesque lobortis enim id risus porttitor porttitor. Nunc facilisis dolor sed felis ultrices, eget molestie quam ultrices. Vivamus semper nibh ut sollicitudin luctus. Donec a lacus aliquam, sollicitudin ex et, mollis elit. Etiam velit odio, placerat ut libero id, elementum sodales dui. Donec a pharetra urna. Proin ac rutrum ante. Quisque vel molestie erat, sit amet efficitur nibh. Sed pretium elit at ligula hendrerit iaculis.",
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ultrices ligula porta lobortis blandit. Phasellus blandit felis dolor, id commodo ipsum molestie vel. Pellentesque lobortis enim id risus porttitor porttitor. Nunc facilisis dolor sed felis ultrices, eget molestie quam ultrices. Vivamus semper nibh ut sollicitudin luctus. Donec a lacus aliquam, sollicitudin ex et, mollis elit. Etiam velit odio, placerat ut libero id, elementum sodales dui. Donec a pharetra urna. Proin ac rutrum ante. Quisque vel molestie erat, sit amet efficitur nibh. Sed pretium elit at ligula hendrerit iaculis."
	);

	hagen.log("Object", { key: "value", number: 42, array: [1, 2, 3] });
	hagen.log("Array", [1, 2, 3, "four", { key: "value" }]);
	hagen.log("Function", () => "This is a message from a function.");
	hagen.log("Error", new Error("This is an error message."));

	hagen.log("Multiple", "New error found:", new Error("Hello, world!"));
	hagen.log("Multiple", 1, "TWO", { three: 4 }, [5, 6, 7], new Error("eight"));

	// Test with timestamp instance
	const timestampLogger = createHagen({
		showTimestamp: true,
	});
	timestampLogger.log("Timestamp", "This message includes a timestamp.");

	// Test fixed width - end truncation
	const fixedWidthEnd = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "end",
		},
	});
	fixedWidthEnd.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: end");

	// Test fixed width - middle truncation
	const fixedWidthMiddle = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "middle",
		},
	});
	fixedWidthMiddle.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: middle");

	// Test fixed width - start truncation
	const fixedWidthStart = createHagen({
		fixedWidth: {
			width: 12,
			truncationMethod: "start",
		},
	});
	fixedWidthStart.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: start");

	console.group();
	hagen.log(`LEVEL 1`);
	console.group();
	hagen.log(`LEVEL 2`);
	console.groupEnd();
	console.groupEnd();
}
