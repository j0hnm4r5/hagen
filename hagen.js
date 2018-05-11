/**
 * A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 */

const chalk = require("chalk");

// TODO: This isn't a super duper safe way to check for Browser/Node/: https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
// Ideally, we shouldn’t even have to check; the logging should work regardless of platform
const isNode =
  typeof process === "object" && `${process}` === "[object process]";

const reservedColors = Object.freeze({
  WARN: "#424242",
  ERROR: "#212121",
  TEXT: "#FAFAFA" // Gray
});

const colors = [
  // Google Material colors (A400): https://gist.github.com/kawanet/a880c83f06d6baf742e45ac9ac52af96
  "#f50057", // Pink
  "#d500f9", // Purple
  "#651fff", // Deep Purple
  "#3d5afe", // Indigo
  "#2979ff", // Blue
  "#00b0ff", // Light Blue
  "#00e5ff", // Cyan
  "#1de9b6", // Teal
  "#00e676", // Green
  "#76ff03", // Light Green
  "#c6ff00", // Lime
  "#ffea00", // Yellow
  "#ff9100", // Orange
  "#ff3d00" // Deep Orange
];

// Writes to console colored text, from the passed-in logger
function logg(logger, color, label, message) {
  // TODO: Try to get rid of the if...else, and just have a uniform logging method
  if (isNode) {
    logger(
      chalk
        .bgHex(color)
        .hex(reservedColors.TEXT)
        .bold(` ${label} `),
      `${message}`
    );
  } else {
    logger(
      `%c ${label} %c ${message}`,
      `background-color: ${color}; color: ${reservedColors.TEXT}`,
      `background-color: inherit; color: inherit`
    );
  }
}

// Basic logger
function log(label, message) {
  // Picks a random color from the array, based on the label name
  let val = 0;
  label.split("").forEach(character => {
    val += character.charCodeAt(0);
  });

  const numColors = colors.length;
  const color = colors[val % numColors];

  logg(console.log, color, label, message);
}

// Warning logger
function warn(label, message) {
  logg(console.warn, reservedColors.WARN, `⚠️  ${label}`, message);
}

// Error logger
function error(label, message) {
  logg(console.error, reservedColors.ERROR, `❌  ${label}`, message);
}


module.exports = { log, warn, error };
