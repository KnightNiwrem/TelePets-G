/**
 * Main entry point for TelePets Telegram Bot
 */
import { Bot } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { initializeDatabase } from "./database/connection.js";
import { runMigrations } from "./database/migrations.js";
import { type BotContext } from "./types/bot.js";
import { userRegistrationMiddleware } from "./bot/middleware.js";
import { registrationConversation } from "./bot/conversations.js";

async function main(): Promise<void> {
  try {
    console.log("🚀 Starting TelePets Bot...");

    // Initialize database
    console.log("📊 Initializing database connection...");
    const db = initializeDatabase();
    
    // Run migrations
    console.log("🔄 Running database migrations...");
    await runMigrations(db);

    // Create bot
    const token = process.env.BOT_TOKEN;
    if (!token) {
      throw new Error("BOT_TOKEN environment variable is required");
    }
    const bot = new Bot<BotContext>(token);

    // Create a composer with error boundary and private chat filtering
    const composer = bot.errorBoundary((error) => {
      console.error("Bot error occurred:", error);
    }).chatType("private");

    // Install conversations plugin
    composer.use(conversations());

    // Register the registration conversation
    composer.use(createConversation(registrationConversation, "registration"));

    // Add user registration middleware
    composer.use(userRegistrationMiddleware);

    // Show pet status
    composer.command("mypet", async (ctx) => {
      if (!ctx.user?.is_registered) {
        await ctx.reply("Please complete registration first by typing /start");
        return;
      }

      const pet = await db
        .selectFrom("pets")
        .innerJoin("pet_types", "pets.pet_type_id", "pet_types.id")
        .select([
          "pets.name",
          "pets.level",
          "pets.experience",
          "pets.happiness",
          "pets.hunger",
          "pets.energy",
          "pet_types.name as type_name"
        ])
        .where("pets.user_id", "=", ctx.user.id)
        .executeTakeFirst();

      if (!pet) {
        await ctx.reply("You don't have a pet yet! Complete your registration to get your first companion.");
        return;
      }

      const emoji = pet.type_name === "cat" ? "🐱" : 
        pet.type_name === "dog" ? "🐶" : 
          pet.type_name === "bird" ? "🐦" : "🐾";

      await ctx.reply(
        `${emoji} **${pet.name}** (${pet.type_name})\n\n` +
        `Level: ${pet.level}\n` +
        `Experience: ${pet.experience}\n` +
        `Happiness: ${pet.happiness}/100\n` +
        `Hunger: ${pet.hunger}/100\n` +
        `Energy: ${pet.energy}/100`,
        { parse_mode: "Markdown" }
      );
    });

    // Help command
    composer.command("help", async (ctx) => {
      await ctx.reply(
        "🎮 **TelePets Commands:**\n\n" +
        "/mypet - Check your pet's status\n" +
        "/help - Show this help message\n\n" +
        "More features coming soon! 🚀",
        { parse_mode: "Markdown" }
      );
    });

    // Start the bot
    console.log("🎮 Starting TelePets bot...");
    await bot.start();
    console.log("✅ TelePets bot is running!");

  } catch (error) {
    console.error("❌ Failed to start TelePets bot:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down TelePets bot...");
  const { closeDatabase } = await import("./database/connection.js");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down TelePets bot...");
  const { closeDatabase } = await import("./database/connection.js");
  await closeDatabase();
  process.exit(0);
});

main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});