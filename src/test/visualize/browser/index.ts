import { run } from "../visualize";

// In browser, we can use URL params as a filter
const urlParameters = new URLSearchParams(globalThis.location.search);
const filter = urlParameters.get("filter") || "all";

run(filter);
