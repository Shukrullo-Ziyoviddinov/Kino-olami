const BotUser = require("../../models/BotUser");
const { normalizeLanguage } = require("../../utils/i18n");

async function touchBotUser(msg, language = "uz") {
  const userId = msg?.from?.id;
  const chatId = msg?.chat?.id;
  if (!userId || !chatId) return;

  const username = String(msg?.from?.username || "").trim();
  const firstName = String(msg?.from?.first_name || "").trim();
  const lastName = String(msg?.from?.last_name || "").trim();

  await BotUser.findOneAndUpdate(
    { userId: Number(userId) },
    {
      $set: {
        userId: Number(userId),
        chatId: Number(chatId),
        username,
        firstName,
        lastName,
        language: normalizeLanguage(language),
        isActive: true,
        lastSeenAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

module.exports = { touchBotUser };
