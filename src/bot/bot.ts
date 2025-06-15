import { Bot, Composer } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { type BotContext } from "../types/bot.js";
import { registrationConversation } from "./conversations.js";

/**
 * Create and configure the bot composer with proper middleware
 */
export function createBotComposer() {
  // Create the main composer with error boundary applied first
  const baseComposer = new Composer<BotContext>().errorBoundary((error) => {
    console.error("Bot error occurred:", error);
  });

  // Create a private chat filtered composer
  const privateChatComposer = baseComposer.chatType("private");

  // Install conversations plugin
  privateChatComposer.use(conversations());

  // Register the registration conversation
  privateChatComposer.use(createConversation(registrationConversation, "registration"));

  return baseComposer;
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