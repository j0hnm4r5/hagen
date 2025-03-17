import { Chalk } from "chalk";
import hagen, { resetConfig, setConfig } from "../index";

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

	setConfig({
		showTimestamp: true,
	});

	hagen.log("Timestamp", "This message includes a timestamp.");

	resetConfig();

	setConfig({
		fixedWidth: {
			width: 12,
			truncationMethod: "end",
		},
	});

	hagen.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: end");

	setConfig({
		fixedWidth: {
			width: 12,
			truncationMethod: "middle",
		},
	});

	hagen.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: middle");

	setConfig({
		fixedWidth: {
			width: 12,
			truncationMethod: "start",
		},
	});

	hagen.log("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Width: 12; Truncation: start");

	resetConfig();

	console.group();
	hagen.log(`LEVEL 1`);
	console.group();
	hagen.log(`LEVEL 2`);
	console.groupEnd();
	console.groupEnd();
}
