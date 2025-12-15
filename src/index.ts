/**
 * Hagen - A colorful logger for JS in Node and in the Browser
 *
 * Named after Hagen the colorful Lumberjack from Synthie Forest
 * https://vimeo.com/90995716
 *
 * @packageDocumentation
 */

// ========= TYPE EXPORTS =========
export type { AnsiFormatter, Color, HagenInstance, Label, RGB } from "./types";

// ========= CONFIG EXPORTS =========
export { defaultConfig } from "./config";
export type { LoggerConfig } from "./config";

// ========= COLOR EXPORTS =========
export { clearColorCache } from "./colors";

// ========= FACTORY EXPORT =========
export { createHagen } from "./logger";

// ========= DEFAULT INSTANCE =========
import { createHagen } from "./logger";

/**
 * Default Hagen logger instance with default configuration.
 *
 * This is a pre-configured instance ready to use immediately without any setup.
 * Perfect for quick logging needs or when you don't need custom configuration.
 *
 * For custom configuration, use {@link createHagen} instead.
 *
 * @example
 * ```typescript
 * // Default import
 * import hagen from "hagen";
 *
 * hagen.log("TEST", "Hello, world!");
 * hagen.info("INFO", "This is informational");
 * hagen.warn("WARNING", "Be careful!");
 * hagen.error("ERROR", "Something went wrong");
 * ```
 *
 * @example
 * ```typescript
 * // Named imports (same instance)
 * import { log, info, warn, error } from "hagen";
 *
 * log("API", "Request received");
 * info("SYSTEM", "Service started");
 * warn("MEMORY", "High usage");
 * error("API", "Failed", error);
 * ```
 */
const defaultInstance = createHagen();

// ========= NAMED METHOD EXPORTS =========

/**
 * General purpose logging method from the default instance.
 * @see {@link HagenInstance.log}
 */
export const log = defaultInstance.log;

/**
 * Error logging method from the default instance.
 * @see {@link HagenInstance.error}
 */
export const error = defaultInstance.error;

/**
 * Warning logging method from the default instance.
 * @see {@link HagenInstance.warn}
 */
export const warn = defaultInstance.warn;

/**
 * Informational logging method from the default instance.
 * @see {@link HagenInstance.info}
 */
export const info = defaultInstance.info;

/**
 * Debug logging method from the default instance.
 * @see {@link HagenInstance.debug}
 */
export const debug = defaultInstance.debug;

// ========= DEFAULT EXPORT =========
export default defaultInstance;
