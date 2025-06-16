import { test, expect, beforeEach, mock, spyOn } from "bun:test";
import { userRegistrationMiddleware } from "./middleware.js";
import type { BotContext } from "../types/bot.js";
import type { Database } from "../database/types.js";
import type { Kysely } from "kysely";

beforeEach(() => {
  // Reset mocks before each test
  mock.restore();
});

function createMockContext(options: {
  fromId?: number;
  chatId?: number;
  firstName?: string;
}): BotContext {
  return {
    from: options.fromId ? {
      id: options.fromId,
      first_name: options.firstName || "TestUser",
      is_bot: false,
      language_code: "en"
    } : undefined,
    chat: options.chatId ? {
      id: options.chatId,
      type: "private"
    } : undefined,
    conversation: {
      enter: mock()
    },
    reply: mock(),
    player: undefined
  } as unknown as BotContext;
}

test("userRegistrationMiddleware should return early when no from user", async () => {
  const ctx = createMockContext({});
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(next).not.toHaveBeenCalled();
});

test("userRegistrationMiddleware should return early when no chat", async () => {
  const ctx = createMockContext({ fromId: 123 });
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(next).not.toHaveBeenCalled();
});

test("userRegistrationMiddleware should create new player when not exists", async () => {
  const getDatabaseSpy = spyOn(await import("../database/connection.js"), "getDatabase").mockImplementation(() => {
    const mockDb = {
      selectFrom: mock(() => ({
        selectAll: mock(() => ({
          where: mock(() => ({
            executeTakeFirst: mock().mockResolvedValue(undefined)
          }))
        }))
      })),
      insertInto: mock(() => ({
        values: mock(() => ({
          returningAll: mock(() => ({
            executeTakeFirst: mock().mockResolvedValue({
              id: 1,
              telegram_id: 123,
              chat_id: 456,
              name: "NewUser",
              is_registered: false,
              created_at: new Date(),
              updated_at: new Date()
            })
          }))
        }))
      }))
    };
    return mockDb as unknown as Kysely<Database>;
  });

  const ctx = createMockContext({ 
    fromId: 123, 
    chatId: 456, 
    firstName: "NewUser" 
  });
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(ctx.player).toBeDefined();
  expect(ctx.player!.telegram_id).toBe(123);
  expect(ctx.conversation.enter).toHaveBeenCalledWith("registration");
  expect(next).not.toHaveBeenCalled();
  
  getDatabaseSpy.mockRestore();
});

test("userRegistrationMiddleware should use existing unregistered player", async () => {
  const existingPlayer = { 
    id: 1, 
    telegram_id: 123, 
    chat_id: 456, 
    name: "ExistingUser", 
    is_registered: false,
    created_at: new Date(),
    updated_at: new Date()
  };

  const getDatabaseSpy = spyOn(await import("../database/connection.js"), "getDatabase").mockImplementation(() => {
    const mockDb = {
      selectFrom: mock(() => ({
        selectAll: mock(() => ({
          where: mock(() => ({
            executeTakeFirst: mock().mockResolvedValue(existingPlayer)
          }))
        }))
      })),
      insertInto: mock(() => ({
        values: mock(() => ({
          returningAll: mock(() => ({
            executeTakeFirst: mock()
          }))
        }))
      }))
    };
    return mockDb as unknown as Kysely<Database>;
  });

  const ctx = createMockContext({ 
    fromId: 123, 
    chatId: 456
  });
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(ctx.player).toBe(existingPlayer);
  expect(ctx.conversation.enter).toHaveBeenCalledWith("registration");
  expect(next).not.toHaveBeenCalled();
  
  getDatabaseSpy.mockRestore();
});

test("userRegistrationMiddleware should call next for registered player", async () => {
  const registeredPlayer = { 
    id: 1, 
    telegram_id: 123, 
    chat_id: 456, 
    name: "RegisteredUser", 
    is_registered: true,
    created_at: new Date(),
    updated_at: new Date()
  };

  const getDatabaseSpy = spyOn(await import("../database/connection.js"), "getDatabase").mockImplementation(() => {
    const mockDb = {
      selectFrom: mock(() => ({
        selectAll: mock(() => ({
          where: mock(() => ({
            executeTakeFirst: mock().mockResolvedValue(registeredPlayer)
          }))
        }))
      }))
    };
    return mockDb as unknown as Kysely<Database>;
  });

  const ctx = createMockContext({ 
    fromId: 123, 
    chatId: 456
  });
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(ctx.player).toBe(registeredPlayer);
  expect(ctx.conversation.enter).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  
  getDatabaseSpy.mockRestore();
});

test("userRegistrationMiddleware should handle database errors gracefully", async () => {
  const getDatabaseSpy = spyOn(await import("../database/connection.js"), "getDatabase").mockImplementation(() => {
    const mockDb = {
      selectFrom: mock(() => ({
        selectAll: mock(() => ({
          where: mock(() => ({
            executeTakeFirst: mock().mockRejectedValue(new Error("Database error"))
          }))
        }))
      }))
    };
    return mockDb as unknown as Kysely<Database>;
  });

  const ctx = createMockContext({ 
    fromId: 123, 
    chatId: 456
  });
  const next = mock();

  await userRegistrationMiddleware(ctx, next);

  expect(ctx.reply).toHaveBeenCalledWith("An error occurred. Please try again later.");
  expect(next).not.toHaveBeenCalled();
  
  getDatabaseSpy.mockRestore();
});