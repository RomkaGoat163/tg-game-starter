import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { verifyInitData, parseUserFromInitData } from './telegram.js';
import { prisma } from './db.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = Fastify({ logger: true });

// CORS
await app.register(fastifyCors, {
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Быстрые служебные маршруты
app.get('/health', async () => ({ ok: true }));
app.get('/', async () => ({ ok: true, at: new Date().toISOString() }));

// Твой авторизационный эндпоинт
app.post('/auth/verify', async (request, reply) => {
  try {
    const body = request.body as any;
    const { initData } = body || {};

    if (!initData || !BOT_TOKEN) {
      reply.code(400);
      return { ok: false, error: 'NO_INITDATA_OR_BOT_TOKEN' };
    }

    const ok = verifyInitData(initData, BOT_TOKEN);
    if (!ok) {
      reply.code(401);
      return { ok: false, error: 'BAD_SIGNATURE' };
    }

    const tgUser = parseUserFromInitData(initData);
    if (!tgUser || !tgUser.id) {
      reply.code(400);
      return { ok: false, error: 'NO_USER' };
    }

    const user = await prisma.user.upsert({
      where: { telegramId: String(tgUser.id) },
      create: {
        telegramId: String(tgUser.id),
        username: tgUser.username || null,
        Wallet: { create: { balance: 100 } },
      },
      update: { username: tgUser.username || null },
      include: { Wallet: true },
    });

    return {
      ok: true,
      user: { id: user.id, username: user.username },
      balance: user.Wallet?.balance ?? 0,
    };
  } catch (e) {
    request.log.error(e);
    reply.code(500);
    return { ok: false, error: 'SERVER_ERROR' };
  }
});

// Запуск
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Server listening on http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
