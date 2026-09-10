const { S3Client } = require("@aws-sdk/client-s3");

function requireEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`${name} .env faylda topilmadi.`);
  }
  return value;
}

const R2_ACCOUNT_ID = requireEnv("R2_ACCOUNT_ID");
const R2_BUCKET_NAME = requireEnv("R2_BUCKET_NAME");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_ENDPOINT = requireEnv("R2_ENDPOINT");

// Custom domain: https://media.chosontv.uz — agar faqat domen yozilsa https qo‘shiladi
function normalizePublicBase(url) {
  let value = String(url || "")
    .trim()
    .replace(/\/+$/, "");
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }
  return value.replace(/\/+$/, "");
}

const R2_PUBLIC_URL = normalizePublicBase(process.env.R2_PUBLIC_URL);

const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  r2Client,
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  R2_PUBLIC_URL,
};
