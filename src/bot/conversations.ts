import { type Conversation } from "@grammyjs/conversations";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "./bot.js";

/**
 * Registration conversation flow
 */
export async function registrationConversation(
  conversation: Conversation<BotContext>,
  ctx: BotContext
): Promise<void> {
  const db = getDatabase();

  await ctx.reply(
    "🎮 Welcome to TelePets! \n\n" +
    "To start your pet-raising adventure, you need to complete registration. " +
    "Are you ready to begin? (yes/no)"
  );

  // Wait for user response
  const response = await conversation.wait();
  const text = response.message?.text?.toLowerCase();

  if (text !== "yes" && text !== "y") {
    await ctx.reply("No worries! Type /start when you're ready to begin your TelePets adventure.");
    return;
  }

  await ctx.reply(
    "🐾 Great! Let's get you registered.\n\n" +
    "You'll get to choose your starter pet in just a moment. " +
    "Are you excited to meet your new companion? (yes/no)"
  );

  const confirmResponse = await conversation.wait();
  const confirmText = confirmResponse.message?.text?.toLowerCase();

  if (confirmText !== "yes" && confirmText !== "y") {
    await ctx.reply("That's okay! Type /start whenever you want to try again.");
    return;
  }

  // Mark user as registered
  if (!ctx.user) {
    throw new Error("User not found in context");
  }

  await db
    .updateTable("users")
    .set({ is_registered: true, updated_at: new Date() })
    .where("id", "=", ctx.user.id)
    .execute();

  await ctx.reply(
    "✅ Registration complete! \n\n" +
    "Now let's choose your starter pet. Type /choosepet to see your options!"
  );
}