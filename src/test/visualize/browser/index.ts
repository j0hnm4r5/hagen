import { run } from "../visualize";

// In browser, we can use URL params as a filter
const urlParams = new URLSearchParams(window.location.search);
const filter = urlParams.get("filter") || "all";

run(filter);
