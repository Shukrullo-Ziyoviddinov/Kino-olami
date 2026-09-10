const translations = {
  uz: {
    chooseLanguage:
      "Bot tilini tanlash uchun qo'yidagilardan birini tanlang.\n\nВыберите один из вариантов ниже, чтобы выбрать язык бота.",
    askCode:
      "🎬 Kino kodini kiriting...\n🍿 Sevimli filmingizni topish uchun uning maxsus kodini yuboring.\n💡 Masalan: 100 yoki 55\n━━━━━━━━━━━━━━\n🔎 Qidiruv tizimi 24/7 faol",
    askCodeNumber: "Kod raqam ko'rinishida yuborilsin. Masalan: 100",
    statusSteps: [
      "🔎 Kod qabul qilindi",
      "🗂 Bazadan qidirilmoqda",
      "✅ Film topildi",
      "📤 Video yuborilmoqda",
      "🎉 Yuborildi",
    ],
    movieNotFound: (code) => `${code} raqamiga mos kino topilmadi.`,
    videoNotFound: "Video topilmadi.",
    sendError: "Kinoni yuborishda xatolik yuz berdi. Keyinroq urinib ko'ring.",
    languageSaved: "O'zbek tili tanlandi.",
    menuPrompt:
      "Botdan foydalanish uchun qo'yidagilardan birini tanlang va o'zingizga kerakli kinoni qidiring.",
    searchPrompt:
      "✅ Qidiruv (yangi)\n1) Bot ichida (@bot) — inputda yozasiz\n2) Chatga nom — oddiy xabar\n3) Ilova",
    botSearchTypePrompt:
      "✅ Qidiruv yoqildi.\n\nPastdagi inputga kino NOMINI yozing.\nMasalan: Avatar\n\nBekor: Bekor",
    botSearchCancelled: "Qidiruv bekor qilindi. Kino kodi yoki Qidiruv tugmasidan foydalaning.",
    botSearchNotFound: "Kino topilmadi.",
    botSearchNoResults: (q) => `"${q}" bo'yicha kino topilmadi. Boshqa nom yozing yoki Qidiruvni qayta bosing.`,
    botSearchResultsHeader: (n) => `✅ ${n} ta natija. Keraklisini tanlang:`,
    subscribeRequired:
      "⚠️ Botdan to'liq foydalanish uchun quyidagi kanallarga obuna bo'ling!",
    checkSubscriptionButton: "✅ Tekshirish",
    telegramSubscriptionMissing:
      "❗️Siz barcha majburiy Telegram kanallarga obuna bo'lmagansiz.",
    subscriptionRequiredKeyboardHidden:
      "⚠️ Obuna talab qilinadi. Avval kanallarga obuna bo'ling.",
  },
  ru: {
    chooseLanguage:
      "Bot tilini tanlash uchun qo'yidagilardan birini tanlang.\n\nВыберите один из вариантов ниже, чтобы выбрать язык бота.",
    askCode:
      "🎬 Введите код фильма...\n🍿 Чтобы найти любимый фильм, отправьте его специальный код.\n💡 Например: 100 или 55\n━━━━━━━━━━━━━━\n🔎 Поиск работает 24/7",
    askCodeNumber: "Код должен быть числом. Например: 100",
    statusSteps: [
      "🔎 Код получен",
      "🗂 Поиск в базе",
      "✅ Фильм найден",
      "📤 Отправка видео",
      "🎉 Отправлено",
    ],
    movieNotFound: (code) => `Фильм по коду ${code} не найден.`,
    videoNotFound: "Видео не найдено.",
    sendError:
      "Произошла ошибка при отправке фильма. Попробуйте еще раз позже.",
    languageSaved: "Выбран русский язык.",
    menuPrompt:
      "Чтобы пользоваться ботом, выберите один из пунктов ниже и найдите нужный фильм.",
    searchPrompt:
      "✅ Поиск (новый)\n1) В боте (@bot) — пишите в поле ввода\n2) Название в чат — обычное сообщение\n3) Приложение",
    botSearchTypePrompt:
      "✅ Поиск включён.\n\nВведите НАЗВАНИЕ фильма в поле внизу.\nНапример: Avatar\n\nОтмена: Отмена",
    botSearchCancelled: "Поиск отменён. Используйте код фильма или кнопку Поиск.",
    botSearchNotFound: "Фильм не найден.",
    botSearchNoResults: (q) => `По запросу «${q}» ничего не найдено. Введите другое название или снова нажмите Поиск.`,
    botSearchResultsHeader: (n) => `✅ Найдено: ${n}. Выберите фильм:`,
    subscribeRequired:
      "⚠️ Для полного использования бота подпишитесь на следующие каналы!",
    checkSubscriptionButton: "✅ Проверить",
    telegramSubscriptionMissing:
      "❗️Вы подписались не на все обязательные Telegram-каналы.",
    subscriptionRequiredKeyboardHidden:
      "⚠️ Требуется подписка. Сначала подпишитесь на каналы.",
  },
};

function normalizeLanguage(language) {
  return language === "ru" ? "ru" : "uz";
}

function t(language, key, ...args) {
  const lang = normalizeLanguage(language);
  const value = translations[lang]?.[key];

  if (typeof value === "function") {
    return value(...args);
  }

  return value || "";
}

module.exports = {
  t,
  normalizeLanguage,
};
