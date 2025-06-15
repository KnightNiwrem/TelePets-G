import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, type Context } from "grammy";
import { getDatabase } from "../database/connection.js";
import type { BotContext } from "../types/bot.js";

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

/**
 * Registration conversation flow with integrated pet selection
 */
export async function registrationConversation(
  conversation: Conversation<BotContext>,
  ctx: Context
): Promise<void> {
  // Send welcome message and directly proceed with registration
  await ctx.reply(
    "🎮 Welcome to TelePets! \n\n" +
    "Let's get you registered and choose your first pet companion!"
  );

  // Get user ID and complete registration
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("Sorry, there was an error. Please try again.");
    return;
  }

  // Complete registration
  await conversation.external(async () => {
    const db = getDatabase();
    
    await db
      .updateTable("users")
      .set({ is_registered: true, updated_at: new Date() })
      .where("telegram_id", "=", userId)
      .execute();
  });

  await ctx.reply("✅ Registration complete! \n\nNow let's choose your starter pet!");

  // Show available starter pets
  const petTypes = await conversation.external(async () => {
    const db = getDatabase();
    return await db
      .selectFrom("pet_types")
      .selectAll()
      .execute();
  });

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

  // Wait for pet selection
  const petSelection = await conversation.waitForCallbackQuery(/^select_pet:(\d+)$/);
  const petTypeIdMatch = petSelection.match?.[1];
  if (!petTypeIdMatch) {
    await petSelection.answerCallbackQuery("Invalid pet selection.");
    return;
  }
  const petTypeId = parseInt(petTypeIdMatch);

  const selectedPetType = petTypes.find(pt => pt.id === petTypeId);
  if (!selectedPetType) {
    await petSelection.answerCallbackQuery("Invalid pet selection.");
    return;
  }

  await petSelection.answerCallbackQuery();
  await petSelection.editMessageText(
    `You chose a ${selectedPetType.name}! 🎉\n\n` +
    "Now, what would you like to name your new companion?\n\n" +
    "Reply with your pet's name:"
  );

  // Wait for pet name
  let petName: string;
  while (true) {
    const nameResponse = await conversation.waitFor("message:text").and((ctx) => {
      const text = ctx.message.text.trim();
      return text.length >= 1 && text.length <= 20;
    });
    
    petName = nameResponse.message.text.trim();
    
    if (petName.length < 1 || petName.length > 20) {
      await ctx.reply("Pet name must be between 1 and 20 characters. Please try again:");
      continue;
    }

    break;
  }

  // Create the pet
  await conversation.external(async () => {
    const db = getDatabase();
    
    // Get the user record first to get the internal user_id
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("telegram_id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      throw new Error("User not found");
    }

    await db
      .insertInto("pets")
      .values({
        user_id: user.id,
        pet_type_id: petTypeId,
        name: petName,
      })
      .execute();
  });

  await ctx.reply(
    `🎉 Congratulations! You now have a ${selectedPetType.name} named **${petName}**!\n\n` +
    `${getPetEmoji(selectedPetType.name)} **${petName}** is ready for adventure!\n\n` +
    "Level: 1\n" +
    "Experience: 0\n" +
    "Happiness: 100/100\n" +
    "Hunger: 100/100\n" +
    "Energy: 100/100\n\n" +
    "Use /mypet to check on your companion anytime!",
    { parse_mode: "Markdown" }
  );
}