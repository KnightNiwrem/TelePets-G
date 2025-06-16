import type { NextFunction } from "grammy";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "../types/bot.js";

/**
 * Middleware to check if player is registered and create player record if not exists
 */
export async function userRegistrationMiddleware(
  ctx: BotContext,
  next: NextFunction
): Promise<void> {
  if (!ctx.from || !ctx.chat) {
    return;
  }

  const db = getDatabase();
  const telegramId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    // Check if player exists in database
    let player = await db
      .selectFrom("players")
      .selectAll()
      .where("telegram_id", "=", telegramId)
      .executeTakeFirst();

    // Create player record if doesn't exist
    if (!player) {
      player = await db
        .insertInto("players")
        .values({
          telegram_id: telegramId,
          chat_id: chatId,
          name: ctx.from.first_name,
          is_registered: false,
        })
        .returningAll()
        .executeTakeFirst();
    }

    // Store player info in context for easy access
    ctx.player = player;

    // If player is not registered, automatically start registration conversation
    if (player && !player.is_registered) {
      await ctx.conversation.enter("registration");
      return;
    }

    await next();
  } catch (error) {
    console.error("Error in user registration middleware:", error);
    await ctx.reply("An error occurred. Please try again later.");
  }
}