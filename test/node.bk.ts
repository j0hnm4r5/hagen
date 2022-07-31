import hagen from "../hagen";

// test label colors
console.log(`========= BASIC =========`);
hagen.log(`COMPONENT`, `Hello, World!`);
hagen.log(`THING`, `Hello, World!`);
hagen.info(`INFO`, `Hello, World!`);

// test warn and error
console.log(`========= WARNING/ERRORS =========`);
hagen.warn(`ABC`, `Something happened!`);
hagen.error(`123`, `This is bad.`);

// test manual colors
console.log(`========= MANUAL COLORS =========`);
hagen.log(`COLOR`, `This is color 0, it should be BLUE`, 0);
hagen.log(`COLOR`, `This is color 1, it should be RED`, 1);
hagen.log(`COLOR`, `This is color 2, it should be YELLOW`, 2);
hagen.log(`COLOR`, `This is color 3, it should be GREEN`, 3);
hagen.log(`COLOR`, `This is color 5, it should be MAGENTA`, 4);
hagen.log(`COLOR`, `This is color 7, it should be CYAN`, 5);

console.log(`========= REPEATED MANUAL COLORS =========`);
hagen.log(`COLOR`, `This is color 8, the same as 0`, 6); // <-- colors should start repeating here
hagen.log(`COLOR`, `This is color 9, the same as 1`, 7);
hagen.log(`COLOR`, `This is color 10, the same as 2`, 8);
hagen.log(`COLOR`, `This is color 11, the same as 3`, 9);

// test custom colors
// console.log(`========= CUSTOM COLORS =========`);
// hagen.log(`COLOR`, `This is color {bg: "#ff00ff", text: "#00ff00"}`, {
// 	bg: `#ff00ff`,
// 	text: `#00ff00`,
// });
// hagen.log(`COLOR`, `This is color {bg: "white", text: "black"}`, {
// 	bg: `white`,
// 	text: `black`,
// });

// test non-strings
console.log(`========= NON-STRINGS =========`);
hagen.log(`OBJECT`, { title: `TEST`, body: `Hello, World!` });
hagen.log(`ARRAY`, [`ONE`, `TWO`, `THREE`]);
hagen.log(`NULL`, null);
hagen.log(`EMPTY`);
hagen.log(`CUSTOM EMPTY`, undefined, 2);
hagen.log(`FUNCTION`, () => {
	console.log(`Hello, World!`);
});
hagen.log(`DATE`, new Date());
hagen.log(`REGEXP`, /abc/);

// test weirdness
console.log(`========= WEIRDNESS =========`);
hagen.log(`COLOR`, `This is color -1, it should be CYAN`, -1);
hagen.log(`COLOR`, `This is color 0.5, it should be RED`, 0.5);
// hagen.log(`COLOR`, `This is color ABC, it should be CYAN`, `ABC`);
// hagen.log(`COLOR`, `This is color {}, it should be CYAN`, {});
// hagen.log(`COLOR`, `This is color {test: 123}, it should be CYAN`, {
// 	test: 123,
// });
// hagen.log(`COLOR`, `This is color {bg: "red", test: 123}, it should be CYAN`, {
// 	bg: `red`,
// 	test: 123,
// });
// hagen.warn(`COLOR`, `This is color 0, it should ignore color`, 0);
// hagen.error(`COLOR`, `This is color 0, it should ignore color`, 0);
// hagen.warn(`COLOR`, `This is color ABC, it should ignore bad color`, `ABC`);
// hagen.error(`COLOR`, `This is color ABC, it should ignore bad color`, `ABC`);

// test grouping
console.log(`========= GROUPING =========`);
hagen.log(`LEVEL 0`);
hagen.group();
hagen.log(`LEVEL 1`);
hagen.group();
hagen.log(`LEVEL 2`);
hagen.warn(`LEVEL 2`);
hagen.info(`LEVEL 2`);
hagen.groupEnd();
hagen.log(`LEVEL 1`);
hagen.groupEnd();
hagen.log(`LEVEL 0`);
