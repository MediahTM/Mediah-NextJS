export const PAGE_SIZES = [5, 10, 20, 30, 40, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const STATIC_REVALIDATION_CACHE = (60 * 60) * 2

export const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
export const DISCORD_ATTACHMENT_REGEX = /^https:\/\/cdn\.discordapp\.com\/attachments\/\d+\/\d+\/[\w-]+\.(?:mediah).*/i;

export const DISCORD_ATTACHMENT_RENEW_API = "https://discord.com/api/v9/attachments/refresh-urls";

export const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"