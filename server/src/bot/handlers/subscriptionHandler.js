const SocialLink = require("../../models/socialLink");
const { t, normalizeLanguage } = require("../../utils/i18n");
const { sendMainMenu } = require("./menuHandler");

const CHECK_SUBSCRIPTION_CALLBACK = "check_subscription";
const TELEGRAM_HOST_RE = /(?:^|\.)t(?:elegram)?\.me$/i;
const TELEGRAM_PATH_RE = /^\/(?:s\/)?(?:joinchat\/|\+)?([a-zA-Z0-9_]{4,})\/?$/;
const TELEGRAM_USERNAME_RE = /^@([a-zA-Z0-9_]{4,})$/;

function normalizeUrl(rawLink = "") {
  const value = String(rawLink || "").trim();
  if (!value) return null;
  const usernameMatch = value.match(TELEGRAM_USERNAME_RE);
  if (usernameMatch) {
    return `https://t.me/${usernameMatch[1]}`;
  }
  if (/^t(?:elegram)?\.me\//i.test(value)) {
    return `https://${value}`;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

function getTelegramChatFromLink(rawLink = "") {
  try {
    const input = String(rawLink || "").trim();
    const usernameMatch = input.match(TELEGRAM_USERNAME_RE);
    if (usernameMatch?.[1]) {
      return `@${usernameMatch[1]}`;
    }

    const normalized = normalizeUrl(rawLink);
    if (!normalized) return null;
    const parsed = new URL(normalized);
    if (!TELEGRAM_HOST_RE.test(parsed.hostname)) {
      return null;
    }

    const match = parsed.pathname.match(TELEGRAM_PATH_RE);
    if (!match) {
      return null;
    }

    const slug = match[1];
    if (!slug || slug.startsWith("+")) {
      return null;
    }

    return `@${slug}`;
  } catch (_error) {
    return null;
  }
}

function isUserSubscribedStatus(member = {}) {
  const status = member?.status;
  if (["creator", "administrator", "member"].includes(status)) {
    return true;
  }
  return status === "restricted" && member?.is_member === true;
}

async function getSubscriptionLinks() {
  const rows = await SocialLink.find({
    type: "subscription",
    isActive: true,
  }).sort({ sortOrder: 1, createdAt: 1 });

  return rows.map((row, idx) => {
    const link = String(row?.link || "").trim();
    const label = String(row?.label || "").trim() || `Link ${idx + 1}`;
    return {
      key: row?.key || `subscription-${idx + 1}`,
      label,
      link,
      telegramChatId: getTelegramChatFromLink(link),
    };
  });
}

function buildSubscriptionKeyboard(links, language) {
  const inline_keyboard = links
    .filter((item) => item.link)
    .map((item) => [{ text: item.label, url: normalizeUrl(item.link) }]);

  inline_keyboard.push([
    {
      text: t(language, "checkSubscriptionButton"),
      callback_data: CHECK_SUBSCRIPTION_CALLBACK,
    },
  ]);

  return { inline_keyboard };
}

async function isBotAdminInChannel(bot, botUserId, chatId) {
  try {
    const botMember = await bot.getChatMember(chatId, botUserId);
    return ["administrator", "creator"].includes(botMember?.status);
  } catch (_error) {
    return false;
  }
}

async function hasUserSubscribedToAllRequiredTelegramChannels(
  bot,
  userId,
  requiredChannelIds
) {
  for (const chatId of requiredChannelIds) {
    try {
      const member = await bot.getChatMember(chatId, userId);
      if (!isUserSubscribedStatus(member)) {
        return false;
      }
    } catch (_error) {
      return false;
    }
  }

  return true;
}

async function sendSubscriptionPrompt(bot, chatId, language) {
  const lang = normalizeLanguage(language);
  const links = await getSubscriptionLinks();
  if (!links.length) {
    await sendMainMenu(bot, chatId, lang);
    return { links: [], requiredChannelIds: [] };
  }

  const me = await bot.getMe();
  const requiredChannelIds = [];

  for (const item of links) {
    if (!item.telegramChatId) continue;
    const isAdmin = await isBotAdminInChannel(bot, me.id, item.telegramChatId);
    if (isAdmin) {
      requiredChannelIds.push(item.telegramChatId);
    }
  }

  await bot.sendMessage(chatId, t(lang, "subscriptionRequiredKeyboardHidden"), {
    reply_markup: { remove_keyboard: true },
  });

  await bot.sendMessage(chatId, t(lang, "subscribeRequired"), {
    reply_markup: buildSubscriptionKeyboard(links, lang),
  });

  return { links, requiredChannelIds };
}

async function handleSubscriptionCheck(bot, query, language) {
  const lang = normalizeLanguage(language);
  const chatId = query?.message?.chat?.id;
  const userId = query?.from?.id;

  if (!chatId || !userId) {
    return;
  }

  const links = await getSubscriptionLinks();
  if (!links.length) {
    await sendMainMenu(bot, chatId, lang);
    return;
  }

  const me = await bot.getMe();
  const requiredChannelIds = [];
  for (const item of links) {
    if (!item.telegramChatId) continue;
    const isAdmin = await isBotAdminInChannel(bot, me.id, item.telegramChatId);
    if (isAdmin) {
      requiredChannelIds.push(item.telegramChatId);
    }
  }

  const ok = await hasUserSubscribedToAllRequiredTelegramChannels(
    bot,
    userId,
    requiredChannelIds
  );

  if (!ok) {
    await sendSubscriptionPrompt(bot, chatId, lang);
    await bot.answerCallbackQuery(query.id, {
      text: t(lang, "telegramSubscriptionMissing"),
      show_alert: false,
    });
    return;
  }

  await bot.answerCallbackQuery(query.id, {
    text: "✅",
    show_alert: false,
  });
  await sendMainMenu(bot, chatId, lang);
}

async function hasUserPassedSubscription(bot, userId) {
  if (!userId) return false;

  const links = await getSubscriptionLinks();
  if (!links.length) {
    return true;
  }

  const me = await bot.getMe();
  const requiredChannelIds = [];
  for (const item of links) {
    if (!item.telegramChatId) continue;
    const isAdmin = await isBotAdminInChannel(bot, me.id, item.telegramChatId);
    if (isAdmin) {
      requiredChannelIds.push(item.telegramChatId);
    }
  }

  return hasUserSubscribedToAllRequiredTelegramChannels(bot, userId, requiredChannelIds);
}

module.exports = {
  CHECK_SUBSCRIPTION_CALLBACK,
  sendSubscriptionPrompt,
  handleSubscriptionCheck,
  hasUserPassedSubscription,
};
