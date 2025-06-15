import { Bot, type Context } from "grammy";
import { conversations, type ConversationFlavor } from "@grammyjs/conversations";

/**
 * Custom properties for our bot context
 */
export interface CustomBotContext {
  user?: {
    id: number;
    telegram_id: string;
    username: string | null;
    first_name: string;
    last_name: string | null;
    is_registered: boolean;
    created_at: Date;
    updated_at: Date;
  };
  pendingPetTypeId?: number;
}

/**
 * Bot context type with conversations support (without sessions as sessions must never be used)
 */
export type BotContext = Context & ConversationFlavor<Context> & CustomBotContext;

/**
 * Create and configure the bot instance
 */
export function createBot(): Bot<BotContext> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  const bot = new Bot<BotContext>(token);

  // Install conversations plugin first (without sessions)
  bot.use(conversations());

  // Use Grammy's built-in error boundary  
  bot.errorBoundary((error) => {
    console.error("Bot error occurred:", error);
  });

  // Use Grammy's built-in chatType for private chats only
  bot.chatType("private");

  return bot;
}