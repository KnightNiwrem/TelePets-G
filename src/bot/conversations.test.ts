import { test, expect } from "bun:test";
import { getPetEmoji } from "./conversations.js";

test("getPetEmoji should return correct emoji for cat", () => {
  expect(getPetEmoji("cat")).toBe("🐱");
  expect(getPetEmoji("Cat")).toBe("🐱");
  expect(getPetEmoji("CAT")).toBe("🐱");
});

test("getPetEmoji should return correct emoji for dog", () => {
  expect(getPetEmoji("dog")).toBe("🐶");
  expect(getPetEmoji("Dog")).toBe("🐶");
  expect(getPetEmoji("DOG")).toBe("🐶");
});

test("getPetEmoji should return correct emoji for bird", () => {
  expect(getPetEmoji("bird")).toBe("🐦");
  expect(getPetEmoji("Bird")).toBe("🐦");
  expect(getPetEmoji("BIRD")).toBe("🐦");
});

test("getPetEmoji should return default emoji for unknown pet types", () => {
  expect(getPetEmoji("dragon")).toBe("🐾");
  expect(getPetEmoji("fish")).toBe("🐾");
  expect(getPetEmoji("")).toBe("🐾");
  expect(getPetEmoji("unknown")).toBe("🐾");
});