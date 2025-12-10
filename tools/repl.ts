import repl from "node:repl";
import util from "node:util";

const { default: hagen } = await import("hagen");
global.hagen = hagen;

repl.start({
	prompt: "> ",
	useGlobal: true,
	ignoreUndefined: true,
	writer: (obj) => util.inspect(obj),
});
