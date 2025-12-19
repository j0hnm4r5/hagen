import { describe, expect, it } from "vitest";
import { fixedWidthFormat, formatTimestamp } from "../format.js";

describe("Format Logic", () => {
	describe("fixedWidthFormat", () => {
		it("should return text as-is if length matches width", () => {
			expect(fixedWidthFormat("12345", 5)).toBe("12345");
		});

		it("should pad text with spaces if shorter than width (center alignment)", () => {
			// "123" (3) -> target 5 -> 2 spaces. 1 left, 1 right.
			expect(fixedWidthFormat("123", 5)).toBe(" 123 ");

			// "12" (2) -> target 5 -> 3 spaces. 1 left, 2 right (Math.floor(3/2)=1)
			expect(fixedWidthFormat("12", 5)).toBe(" 12  ");
		});

		it("should truncate with ellipsis at end (default)", () => {
			// "123456" -> target 5. Ellipsis "~" (length 1). Keep 4 chars.
			expect(fixedWidthFormat("123456", 5, "end")).toBe("1234~");
		});

		it("should truncate with ellipsis at start", () => {
			// "123456" -> target 5. Ellipsis "~". Keep last 4 chars.
			expect(fixedWidthFormat("123456", 5, "start")).toBe("~3456");
		});

		it("should truncate with ellipsis in middle", () => {
			// "12345678" -> target 5. Ellipsis "~". Keep 4 chars. 2 front, 2 back.
			expect(fixedWidthFormat("12345678", 5, "middle")).toBe("12~78");

			// "1234567" -> target 5. Keep 4 chars.
			expect(fixedWidthFormat("1234567", 5, "middle")).toBe("12~67");
		});
	});

	describe("formatTimestamp", () => {
		it("should format as ISO string by default", () => {
			// If we pass an object without a formatter function:
			const result = formatTimestamp({} as any);
			expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
		});

		it("should use custom formatter if provided", () => {
			const config = {
				timestampFormatter: (_d: Date) => "CUSTOM",
			} as any;
			expect(formatTimestamp(config)).toBe("CUSTOM");
		});
	});
});
