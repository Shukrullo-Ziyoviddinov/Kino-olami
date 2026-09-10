const userLanguageMap = new Map();
const awaitingSearchMap = new Map();

function setUserLanguage(userId, language) {
  if (!userId || !language) {
    return;
  }

  userLanguageMap.set(String(userId), language);
}

function getUserLanguage(userId) {
  if (!userId) {
    return null;
  }

  return userLanguageMap.get(String(userId)) || null;
}

function setAwaitingSearch(userId, value = true) {
  if (!userId) return;
  if (value) {
    awaitingSearchMap.set(String(userId), true);
  } else {
    awaitingSearchMap.delete(String(userId));
  }
}

function isAwaitingSearch(userId) {
  if (!userId) return false;
  return awaitingSearchMap.get(String(userId)) === true;
}

function clearAwaitingSearch(userId) {
  setAwaitingSearch(userId, false);
}

module.exports = {
  setUserLanguage,
  getUserLanguage,
  setAwaitingSearch,
  isAwaitingSearch,
  clearAwaitingSearch,
};
