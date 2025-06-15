import { Bot, Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { type BotContext } from "../types/bot.js";
import { registrationConversation } from "./conversations.js";

/**
 * Create and configure the bot composer with proper middleware
 */
export function createBotComposer(): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Install conversations plugin first (without sessions)
  composer.use(conversations());

  // Register the registration conversation
  composer.use(createConversation(registrationConversation, "registration"));

  return composer;
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