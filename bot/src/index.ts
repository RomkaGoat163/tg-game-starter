import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
const webappUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

if (!token) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard().webApp('🎮 Играть', webappUrl);
  await ctx.reply('Поехали! Нажми, чтобы открыть игру 👇', { reply_markup: kb });
});

bot.start();
console.log('Bot started');
