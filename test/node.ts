import chalk from "chalk";
import hagen from "../hagen";

console.log(chalk.bgRed.white.bold("RED"));
console.log(chalk.supportsColor);

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
