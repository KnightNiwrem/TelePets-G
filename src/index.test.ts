import { test, expect } from "bun:test";

/**
 * Integration test to verify the application modules are structured correctly
 */
test("application modules should be properly structured", async () => {
  // Test that key modules can be imported without execution
  const { initializeDatabase, getDatabase, closeDatabase } = await import("./database/connection.js");
  const { userRegistrationMiddleware } = await import("./bot/middleware.js");
  const { registrationConversation, getPetEmoji } = await import("./bot/conversations.js");
  
  expect(typeof initializeDatabase).toBe("function");
  expect(typeof getDatabase).toBe("function");
  expect(typeof closeDatabase).toBe("function");
  expect(typeof userRegistrationMiddleware).toBe("function");
  expect(typeof registrationConversation).toBe("function");
  expect(typeof getPetEmoji).toBe("function");
});