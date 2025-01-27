import { describe, expect, it } from "vitest";
import { isValidUUID } from "./validators";
import { randomUUID } from "crypto";

describe("isValidUUID", () => {
  it("returns true for a valid UUID", () => {
    expect(isValidUUID(randomUUID())).toBe(true);
  });

  it("returns false for an invalid UUID", () => {
    expect(isValidUUID("123e4567-e89b-12d3-a456-4266141740")).toBe(false);
  });

  it("returns false for an empty UUID", () => {
    expect(isValidUUID("")).toBe(false);
  });
});
