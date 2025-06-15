import { InlineKeyboard } from "grammy";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "./bot.js";

/**
 * Show available starter pets
 */
export async function showStarterPets(ctx: BotContext): Promise<void> {
  const db = getDatabase();

  try {
    // Get available pet types
    const petTypes = await db
      .selectFrom("pet_types")
      .selectAll()
      .execute();

    if (petTypes.length === 0) {
      await ctx.reply("No starter pets available at the moment. Please try again later.");
      return;
    }

    const keyboard = new InlineKeyboard();
    
    petTypes.forEach((petType) => {
      keyboard.text(
        `${getPetEmoji(petType.name)} ${petType.name}`, 
        `select_pet:${petType.id}`
      ).row();
    });

    await ctx.reply(
      "🐾 Choose your starter pet! \n\n" +
      "Each pet has unique characteristics:\n\n" +
      petTypes.map(pet => 
        `${getPetEmoji(pet.name)} **${pet.name}**: ${pet.description}\n` +
        `Stats: ${Object.entries(pet.base_stats as Record<string, number>)
          .map(([stat, value]) => `${stat}: ${value}`)
          .join(", ")}`
      ).join("\n\n"),
      { 
        reply_markup: keyboard,
        parse_mode: "Markdown"
      }
    );
  } catch (error) {
    console.error("Error showing starter pets:", error);
    await ctx.reply("An error occurred while loading pets. Please try again.");
  }
}

/**
 * Handle pet selection
 */
export async function handlePetSelection(ctx: BotContext): Promise<void> {
  if (!ctx.callbackQuery?.data) {
    return;
  }

  const data = ctx.callbackQuery.data;
  if (!data.startsWith("select_pet:")) {
    return;
  }

  const petTypeIdStr = data.split(":")[1];
  if (!petTypeIdStr) {
    await ctx.answerCallbackQuery("Invalid pet selection.");
    return;
  }

  const petTypeId = parseInt(petTypeIdStr);
  if (isNaN(petTypeId)) {
    await ctx.answerCallbackQuery("Invalid pet selection.");
    return;
  }

  const db = getDatabase();

  try {
    // Check if user already has a pet
    const existingPet = await db
      .selectFrom("pets")
      .selectAll()
      .where("user_id", "=", ctx.user!.id)
      .executeTakeFirst();

    if (existingPet) {
      await ctx.answerCallbackQuery("You already have a pet!");
      await ctx.reply("You already have a pet! Use /mypet to see your companion.");
      return;
    }

    // Get the selected pet type
    const petType = await db
      .selectFrom("pet_types")
      .selectAll()
      .where("id", "=", petTypeId)
      .executeTakeFirst();

    if (!petType) {
      await ctx.answerCallbackQuery("Pet type not found.");
      return;
    }

    // Ask for pet name
    await ctx.editMessageText(
      `You chose a ${petType.name}! 🎉\n\n` +
      "Now, what would you like to name your new companion?\n\n" +
      "Reply with your pet's name:"
    );

    await ctx.answerCallbackQuery();

    // Store pet type selection temporarily (in production, you might use a proper state store)
    ctx.pendingPetTypeId = petTypeId;

  } catch (error) {
    console.error("Error handling pet selection:", error);
    await ctx.answerCallbackQuery("An error occurred. Please try again.");
  }
}

/**
 * Handle pet naming
 */
export async function handlePetNaming(ctx: BotContext): Promise<void> {
  if (!ctx.message?.text || !ctx.pendingPetTypeId) {
    return;
  }

  const petName = ctx.message.text.trim();
  
  if (petName.length < 1 || petName.length > 20) {
    await ctx.reply("Pet name must be between 1 and 20 characters. Please try again:");
    return;
  }

  const db = getDatabase();

  try {
    // Create the pet
    await db
      .insertInto("pets")
      .values({
        user_id: ctx.user!.id,
        pet_type_id: ctx.pendingPetTypeId,
        name: petName,
      })
      .execute();

    // Get pet type info
    const petType = await db
      .selectFrom("pet_types")
      .selectAll()
      .where("id", "=", ctx.pendingPetTypeId)
      .executeTakeFirst();

    delete ctx.pendingPetTypeId;

    await ctx.reply(
      `🎉 Congratulations! You now have a ${petType!.name} named **${petName}**!\n\n` +
      `${getPetEmoji(petType!.name)} **${petName}** is ready for adventure!\n\n` +
      "Level: 1\n" +
      "Experience: 0\n" +
      "Happiness: 100/100\n" +
      "Hunger: 100/100\n" +
      "Energy: 100/100\n\n" +
      "Use /mypet to check on your companion anytime!",
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("Error creating pet:", error);
    await ctx.reply("An error occurred while creating your pet. Please try again.");
  }
}

/**
 * Get emoji for pet type
 */
function getPetEmoji(petType: string): string {
  switch (petType.toLowerCase()) {
  case "cat":
    return "🐱";
  case "dog":
    return "🐶";
  case "bird":
    return "🐦";
  default:
    return "🐾";
  }
}