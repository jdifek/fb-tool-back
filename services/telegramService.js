const axios = require('axios');

function escapeMarkdownV2(text = '') {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

async function sendTelegramMessage(rawText) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = escapeMarkdownV2(rawText);

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'MarkdownV2',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('❌ Telegram send error:', err.response?.data || err.message);
  }
}

module.exports = { sendTelegramMessage };
