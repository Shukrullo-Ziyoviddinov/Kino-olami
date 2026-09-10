const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");
const { messageHandler } = require("./handlers/messageHandler");
const {
  callbackHandler,
  sendLanguageSelector,
} = require("./handlers/callbackHandlers");
const { inlineQueryHandler } = require("./handlers/inlineQueryHandler");
const { touchBotUser } = require("./handlers/botUserTracker");

dotenv.config();

const token = process.env.BOT_TOKEN;

let bot = null;

if (!token) {
  console.warn("BOT_TOKEN topilmadi. Telegram bot ishga tushmadi.");
} else {
  // Avval polling yoqilmasin — webhook o'chirilgach startPolling
  bot = new TelegramBot(token, { polling: false });

  bot.on("polling_error", (error) => {
    console.error("Polling xatoligi:", error?.message || error);
  });
  bot.on("webhook_error", (error) => {
    console.error("Webhook xatoligi:", error?.message || error);
  });

  bot.onText(/^\/start$/, async (msg) => {
    try {
      try {
        await touchBotUser(msg, "uz");
      } catch (_error) {
        // ignore
      }
      await sendLanguageSelector(bot, msg.chat.id);
    } catch (error) {
      console.error("/start handler xatoligi:", error?.message || error);
    }
  });

  bot.onText(/^\/search(?:@\w+)?$/i, async (msg) => {
    try {
      const { setAwaitingSearch, getUserLanguage } = require("../utils/userState");
      const { normalizeLanguage, t } = require("../utils/i18n");
      const language = normalizeLanguage(
        getUserLanguage(msg?.from?.id) ||
          (msg?.from?.language_code?.toLowerCase()?.startsWith("ru") ? "ru" : "uz")
      );
      setAwaitingSearch(msg.from.id, true);
      await bot.sendMessage(msg.chat.id, t(language, "botSearchTypePrompt"));
    } catch (error) {
      console.error("/search handler xatoligi:", error?.message || error);
    }
  });

  bot.on("callback_query", async (query) => {
    try {
      await callbackHandler(bot, query);
    } catch (error) {
      console.error("callback_query handler xatoligi:", error?.message || error);
    }
  });

  bot.on("inline_query", async (query) => {
    console.log(
      "inline_query:",
      query?.from?.id,
      JSON.stringify(query?.query || "")
    );
    try {
      await inlineQueryHandler(bot, query);
    } catch (error) {
      console.error("inline_query handler xatoligi:", error?.message || error);
      try {
        await bot.answerInlineQuery(query.id, [], {
          cache_time: 0,
          is_personal: true,
        });
      } catch (_e) {
        // ignore
      }
    }
  });

  bot.on("message", async (msg) => {
    const text = (msg?.text || "").trim();
    if (text === "/start" || /^\/search(?:@\w+)?$/i.test(text)) {
      return;
    }

    try {
      try {
        await touchBotUser(
          msg,
          msg?.from?.language_code?.toLowerCase()?.startsWith("ru") ? "ru" : "uz"
        );
      } catch (_error) {
        // ignore
      }
      await messageHandler(bot, msg);
    } catch (error) {
      console.error("message handler xatoligi:", error?.message || error);
    }
  });

  bot
    .deleteWebHook({ drop_pending_updates: false })
    .catch((error) => {
      console.warn("deleteWebHook:", error?.message || error);
    })
    .finally(() => {
      // allowed_updates BERILMASIN: ba'zi klientlar arrayni noto'g'ri
      // serialize qilib faqat message qoldiradi — inline_query umuman kelmaydi.
      bot
        .startPolling({
          interval: 300,
          params: {
            timeout: 30,
          },
        })
        .then(() => {
          console.log("Telegram bot ishga tushdi (barcha update lar, inline_query bilan).");
        })
        .catch((error) => {
          console.error("startPolling xatoligi:", error?.message || error);
        });
    });
}

module.exports = bot;
