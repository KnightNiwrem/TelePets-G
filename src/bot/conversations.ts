import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "../types/bot.js";

/**
 * Registration conversation flow
 */
export async function registrationConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext
): Promise<void> {
  const db = getDatabase();

  // Send welcome message with inline keyboard
  const keyboard = new InlineKeyboard()
    .text("✅ Yes, let's start!", "register_yes")
    .row()
    .text("❌ Maybe later", "register_no");

  await ctx.reply(
    "🎮 Welcome to TelePets! \n\n" +
    "To start your pet-raising adventure, you need to complete registration. " +
    "Are you ready to begin? Choose an option below:",
    { reply_markup: keyboard }
  );

  // Wait for callback query response
  const response = await conversation.waitForCallbackQuery(/^register_(yes|no)$/);

  if (response.match[1] === "no") {
    await response.answerCallbackQuery();
    await response.editMessageText("No worries! Type /start when you're ready to begin your TelePets adventure.");
    return;
  }

  // User chose yes, complete registration
  if (!ctx.user) {
    throw new Error("User not found in context");
  }

  await db
    .updateTable("users")
    .set({ is_registered: true, updated_at: new Date() })
    .where("id", "=", ctx.user.id)
    .execute();

  await response.answerCallbackQuery();
  await response.editMessageText(
    "✅ Registration complete! \n\n" +
    "Now let's choose your starter pet. Use /choosepet to see your options!"
  );
}