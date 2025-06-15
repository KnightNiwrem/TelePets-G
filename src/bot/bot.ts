import { Bot, Composer } from "grammy";
import { conversations } from "@grammyjs/conversations";
import { type BotContext } from "../types/bot.js";

/**
 * Create and configure the bot composer with proper middleware
 */
export function createBotComposer(): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Install conversations plugin first (without sessions)
  composer.use(conversations());

  // Use type assertion to work around type compatibility issues
  const protectedComposer = composer.errorBoundary((error) => {
    console.error("Bot error occurred:", error);
  }) as Composer<BotContext>;

  const privateComposer = protectedComposer.chatType("private") as Composer<BotContext>;

  return privateComposer;
}

/**
 * Create the main bot instance
 */
export function createBot(): Bot<BotContext> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  return new Bot<BotContext>(token);
}