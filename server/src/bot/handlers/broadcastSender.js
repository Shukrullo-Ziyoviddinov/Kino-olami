const BotUser = require("../../models/BotUser");
const { getWebAppUrl } = require("../webAppUrl");

const CAPTION_MAX = 1024;
const TEXT_MAX = 4096;

function buildMovieUrl(movieId) {
  return `${getWebAppUrl()}/movie/${movieId}`;
}

function normalizeButtons(rawButtons = []) {
  if (!Array.isArray(rawButtons)) return [];
  return rawButtons
    .map((item) => ({
      label: String(item?.label || "").trim(),
      type: item?.type === "movie" ? "movie" : "url",
      movieId: item?.movieId,
      url: String(item?.url || "").trim(),
    }))
    .filter((item) => item.label)
    .map((item) => {
      if (item.type === "movie" && Number.isFinite(Number(item.movieId))) {
        return {
          text: item.label,
          web_app: { url: buildMovieUrl(Number(item.movieId)) },
        };
      }
      if (item.url) {
        return {
          text: item.label,
          url: item.url,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function buildInlineKeyboard(rawButtons = []) {
  const buttons = normalizeButtons(rawButtons);
  if (!buttons.length) return null;
  return {
    inline_keyboard: buttons.map((btn) => [btn]),
  };
}

function parseDataUrl(dataUrl = "") {
  const input = String(dataUrl || "").trim();
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const base64Body = match[2];
  return {
    mimeType,
    buffer: Buffer.from(base64Body, "base64"),
  };
}

function buildText(title = "", text = "") {
  const safeTitle = String(title || "").trim();
  const safeText = String(text || "").trim();
  return [safeTitle, safeText].filter(Boolean).join("\n\n").trim();
}

async function sendSingleBroadcast(bot, chatId, payload) {
  const inlineMarkup = buildInlineKeyboard(payload?.buttons);
  const text = buildText(payload?.title, payload?.text);
  const mediaType = payload?.mediaType;
  const mediaDataUrl = payload?.mediaDataUrl;

  if (mediaType === "photo" && mediaDataUrl) {
    const parsed = parseDataUrl(mediaDataUrl);
    if (!parsed) throw new Error("Rasm formati noto'g'ri.");
    await bot.sendPhoto(
      chatId,
      parsed.buffer,
      {
        caption: text ? text.slice(0, CAPTION_MAX) : undefined,
        reply_markup: inlineMarkup || undefined,
      },
      { filename: "broadcast-photo.jpg", contentType: parsed.mimeType }
    );
    return;
  }

  if (mediaType === "video" && mediaDataUrl) {
    const parsed = parseDataUrl(mediaDataUrl);
    if (!parsed) throw new Error("Video formati noto'g'ri.");
    await bot.sendVideo(
      chatId,
      parsed.buffer,
      {
        caption: text ? text.slice(0, CAPTION_MAX) : undefined,
        supports_streaming: true,
        reply_markup: inlineMarkup || undefined,
      },
      { filename: "broadcast-video.mp4", contentType: parsed.mimeType }
    );
    return;
  }

  await bot.sendMessage(chatId, (text || "").slice(0, TEXT_MAX), {
    reply_markup: inlineMarkup || undefined,
  });
}

async function sendBroadcastToAll(bot, payload) {
  const users = await BotUser.find({ isActive: true }).select({ chatId: 1, userId: 1 }).lean();
  let successCount = 0;
  let failedCount = 0;

  for (const user of users) {
    try {
      await sendSingleBroadcast(bot, user.chatId, payload);
      successCount += 1;
    } catch (error) {
      failedCount += 1;
      const code = Number(error?.response?.body?.error_code);
      if (code === 403) {
        await BotUser.updateOne({ userId: user.userId }, { $set: { isActive: false } });
      }
    }
  }

  return {
    total: users.length,
    success: successCount,
    failed: failedCount,
  };
}

module.exports = {
  sendBroadcastToAll,
};
