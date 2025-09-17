// server/src/index.ts
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { verifyInitData, parseUserFromInitData } from './telegram.js';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED_REJECTION', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION', err);
});

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, {
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Простые проверки доступности
  app.get('/health', async () => ({ ok: true, mode: 'no-db' }));
  app.get('/', async () => ({ ok: true, at: new Date().toISOString() }));

  // Верификация Telegram initData без записи в БД
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
      if (!tgUser?.id) {
        reply.code(400);
        return { ok: false, error: 'NO_USER' };
      }

      // НИЧЕГО не пишем в БД — просто возвращаем данные
      return {
        ok: true,
        user: { id: tgUser.id, username: tgUser.username || null },
      };
    } catch (e) {
      request.log.error(e);
      reply.code(500);
      return { ok: false, error: 'SERVER_ERROR' };
    }
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error({ err }, 'FAILED_TO_LISTEN');
    process.exit(1);
  }
}

bootstrap().catch((e) => {
  console.error('BOOTSTRAP_ERROR', e);
  process.exit(1);
});
