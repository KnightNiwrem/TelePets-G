/**
 * Main entry point for TelePets Telegram Bot
 */
import { initializeDatabase } from "./database/connection.js";
import { runMigrations } from "./database/migrations.js";
import { createBot } from "./bot/bot.js";
import { userRegistrationMiddleware } from "./bot/middleware.js";
import { showStarterPets, handlePetSelection, handlePetNaming } from "./bot/pets.js";

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
    console.log("🤖 Creating bot instance...");
    const bot = createBot();

    // Add user registration middleware
    bot.use(userRegistrationMiddleware);

    // Bot commands
    bot.command("start", async (ctx) => {
      if (!ctx.user) {
        await ctx.reply("An error occurred. Please try again.");
        return;
      }

      if (!ctx.user.is_registered) {
        await ctx.reply(
          "🎮 Welcome to TelePets! \n\n" +
          "To start your pet-raising adventure, you need to complete registration. " +
          "Are you ready to begin? Choose an option below:"
        );
        
        // Simple registration flow
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Yes, let's start!", callback_data: "register_yes" }],
              [{ text: "❌ Maybe later", callback_data: "register_no" }]
            ]
          }
        };
        
        await ctx.reply("Choose an option:", keyboard);
      } else {
        await ctx.reply(
          `👋 Welcome back, ${ctx.user.first_name}!\n\n` +
          "Your TelePets adventure continues! Use /mypet to check on your companion or /help for available commands."
        );
      }
    });

    // Handle registration responses
    bot.callbackQuery("register_yes", async (ctx) => {
      if (!ctx.user) return;
      
      await db
        .updateTable("users")
        .set({ is_registered: true, updated_at: new Date() })
        .where("id", "=", ctx.user.id)
        .execute();

      await ctx.answerCallbackQuery();
      await ctx.editMessageText(
        "✅ Registration complete! \n\n" +
        "Now let's choose your starter pet. Use /choosepet to see your options!"
      );
    });

    bot.callbackQuery("register_no", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("No worries! Type /start when you're ready to begin your TelePets adventure.");
    });

    // Pet selection commands
    bot.command("choosepet", async (ctx) => {
      if (!ctx.user?.is_registered) {
        await ctx.reply("Please complete registration first by typing /start");
        return;
      }

      // Check if user already has a pet
      const existingPet = await db
        .selectFrom("pets")
        .selectAll()
        .where("user_id", "=", ctx.user.id)
        .executeTakeFirst();

      if (existingPet) {
        await ctx.reply("You already have a pet! Use /mypet to see your companion.");
        return;
      }

      await showStarterPets(ctx);
    });

    // Handle pet selection callbacks
    bot.callbackQuery(/^select_pet:/, handlePetSelection);

    // Handle pet naming (simple text handler for now)
    bot.on("message:text", async (ctx) => {
      if (ctx.pendingPetTypeId) {
        await handlePetNaming(ctx);
      }
    });

    // Show pet status
    bot.command("mypet", async (ctx) => {
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
        await ctx.reply("You don't have a pet yet! Use /choosepet to get your first companion.");
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
    bot.command("help", async (ctx) => {
      await ctx.reply(
        "🎮 **TelePets Commands:**\n\n" +
        "/start - Begin your adventure\n" +
        "/choosepet - Select your starter pet\n" +
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