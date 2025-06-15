import { type Context } from "grammy";
import { type ConversationFlavor } from "@grammyjs/conversations";

/**
 * Custom properties for our bot context
 */
export interface CustomBotContext {
  user?: {
    id: number;
    telegram_id: number;
    username: string | null;
    name: string;
    is_registered: boolean;
    created_at: Date;
    updated_at: Date;
  };
  pendingPetTypeId?: number;
}

/**
 * Bot context type with conversations support (without sessions as sessions must never be used)
 */
export type BotContext = ConversationFlavor<Context & CustomBotContext>;