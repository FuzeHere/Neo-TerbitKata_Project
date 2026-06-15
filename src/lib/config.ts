export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "default_captcha_secret_key_123456",
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  spamKeywords: process.env.SPAM_KEYWORDS
    ? process.env.SPAM_KEYWORDS.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)
    : ["slot online", "judi online", "casino online"],
};
