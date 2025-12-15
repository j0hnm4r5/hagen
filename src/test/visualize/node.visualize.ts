import {
	test,
	visualizeConfigurations,
	visualizeEdgeCases,
	visualizeQuantization,
} from "./visualize";

// Run the standard test
test();

// Show palette quantization comparisons
visualizeQuantization();

// Show configuration variations
visualizeConfigurations();

// Show edge cases
visualizeEdgeCases();
