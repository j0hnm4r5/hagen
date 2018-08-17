/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

const chalk = require(`chalk`);
const isNode = require(`detect-node`);

const materialColors = require(`./utils/gColors`);

const textColors = Object.freeze({
    LIGHT: materialColors.gray[50],
    DARK: materialColors.gray[900],
});

const reservedColors = Object.freeze({
    WARN: { bg: materialColors.gray[500], text: textColors.DARK },
    ERROR: { bg: materialColors.gray[900], text: textColors.LIGHT },
});

const colors = [
    { bg: materialColors.blue[500], text: textColors.LIGHT }, // blue
    { bg: materialColors.red[500], text: textColors.LIGHT }, // red
    { bg: materialColors.yellow[500], text: textColors.DARK }, // yellow
    { bg: materialColors.green[500], text: textColors.LIGHT }, // green
    { bg: materialColors.orange[500], text: textColors.LIGHT }, // orange
    { bg: materialColors.pink[500], text: textColors.LIGHT }, // pink
    { bg: materialColors.purple[500], text: textColors.LIGHT }, // purple
    { bg: materialColors.cyan[500], text: textColors.DARK }, // cyan
];

// Writes to console colored text, from the passed-in logger
function logg(logger, color, label, message) {
    // TODO: Try to get rid of the if...else, and just have a uniform logging method
    if (isNode) {
        logger(
            chalk
                .bgHex(color.bg)
                .hex(color.text)
                .bold(` ${label} `),
            `${message}`
        );
    } else {
        logger(
            `%c ${label} %c ${message}`,
            `background-color: ${color.bg}; color: ${color.text}`,
            `background-color: inherit; color: inherit`
        );
    }
}

// Basic logger
function log(label, message, manualColor) {
    // Picks a random color from the array, based on the label name
    let val = 0;
    label.split(``).forEach((character) => {
        val += character.charCodeAt(0);
    });

    const numColors = colors.length;
    let color;
    if (
        manualColor !== undefined &&
        typeof manualColor === `number` &&
        manualColor >= 0
    ) {
        color = colors[Math.round(manualColor) % numColors];
    } else {
        color = colors[val % numColors];
    }

    logg(console.log, color, label, message);
}

// Warning logger
function warn(label, message) {
    logg(console.warn, reservedColors.WARN, `⚠️  ${label}`, message);
}

// Error logger
function error(label, message) {
    logg(
        console.error,
        reservedColors.ERROR,
        `❌  ${label}`,
        message
    );
}

module.exports = { log, warn, error };
