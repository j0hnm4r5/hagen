import hagen from "../hagen";

// test label colors
hagen.log(`COMPONENT`, `Hello, World!`);
hagen.log(`THING`, `Hello, World!`);

// test warn and error
hagen.warn(`ABC`, `Something happened!`);
hagen.error(`123`, `This is bad.`);

// test manual colors
hagen.log(`COLOR`, `This is color 0`, 0);
hagen.log(`COLOR`, `This is color 1`, 1);
hagen.log(`COLOR`, `This is color 2`, 2);
hagen.log(`COLOR`, `This is color 3`, 3);
hagen.log(`COLOR`, `This is color 4`, 4);
hagen.log(`COLOR`, `This is color 5`, 5);
hagen.log(`COLOR`, `This is color 6`, 6);
hagen.log(`COLOR`, `This is color 7`, 7);

hagen.log(`COLOR`, `This is color 8`, 8); // <-- colors should start repeating here
hagen.log(`COLOR`, `This is color 9`, 9);
hagen.log(`COLOR`, `This is color 10`, 10);
hagen.log(`COLOR`, `This is color 11`, 11);
hagen.log(`COLOR`, `This is color 12`, 12);

// test custom colors
hagen.log(`COLOR`, `This is color {bg: "#ff00ff", text: "#00ff00"}`, {
	bg: `#ff00ff`,
	text: `#00ff00`,
});
hagen.log(`COLOR`, `This is color {bg: "white", text: "black"}`, {
	bg: `white`,
	text: `black`,
});

// test weirdness
hagen.log(`COLOR`, `This is color -1`, -1);
hagen.log(`COLOR`, `This is color 0.5`, 0.5);
hagen.log(`COLOR`, `This is color ABC`, `ABC`);
hagen.log(`COLOR`, `This is color {}`, {});
hagen.log(`COLOR`, `This is color {test: 123}`, { test: 123 });
hagen.log(`COLOR`, `This is color {bg: "red", test: 123}`, {
	bg: `red`,
	test: 123,
});
hagen.warn(`COLOR`, `This is color 0`, 0);
hagen.error(`COLOR`, `This is color 0`, 0);
hagen.warn(`COLOR`, `This is color ABC`, `ABC`);
hagen.error(`COLOR`, `This is color ABC`, `ABC`);
