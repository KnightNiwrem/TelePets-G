import type { NextFunction } from "grammy";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "../types/bot.js";

/**
 * Middleware to check if user is registered and create user record if not exists
 */
export async function userRegistrationMiddleware(
  ctx: BotContext,
  next: NextFunction
): Promise<void> {
  if (!ctx.from) {
    return;
  }

  const db = getDatabase();
  const telegramId = ctx.from.id;

  try {
    // Check if user exists in database
    let user = await db
      .selectFrom("users")
      .selectAll()
      .where("telegram_id", "=", telegramId)
      .executeTakeFirst();

    // Create user record if doesn't exist
    if (!user) {
      user = await db
        .insertInto("users")
        .values({
          telegram_id: telegramId,
          username: ctx.from.username || null,
          name: ctx.from.first_name,
          is_registered: false,
        })
        .returningAll()
        .executeTakeFirst();
    }

    // Store user info in context for easy access
    ctx.user = user;

    // If user is not registered, automatically start registration conversation
    if (user && !user.is_registered) {
      await ctx.conversation.enter("registration");
      return;
    }

    await next();
  } catch (error) {
    console.error("Error in user registration middleware:", error);
    await ctx.reply("An error occurred. Please try again later.");
  }
}