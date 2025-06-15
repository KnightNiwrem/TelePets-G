import { Bot, Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { type BotContext } from "../types/bot.js";
import { registrationConversation } from "./conversations.js";

/**
 * Create and configure the bot composer with proper middleware
 */
export function createBotComposer() {
  const composer = new Composer<BotContext>();

  // Install conversations plugin first (without sessions)
  composer.use(conversations());

  // Register the registration conversation
  composer.use(createConversation(registrationConversation, "registration"));

  return composer;
}

/**
 * Create the main bot instance with error boundary and private chat filtering
 */
export function createBot(): Bot<BotContext> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  const bot = new Bot<BotContext>(token);
  
  // Apply error boundary and private chat filtering to the bot
  bot.errorBoundary((error) => {
    console.error("Bot error occurred:", error);
  });
  
  bot.chatType("private");

  return bot;
}