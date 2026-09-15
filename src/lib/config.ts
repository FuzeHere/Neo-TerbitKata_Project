if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "FATAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing in production!"
  );
}

export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "dev_local_only_captcha_secret_key",
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
