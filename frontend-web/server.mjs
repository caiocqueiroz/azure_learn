import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const apiBaseUrl = process.env.API_GATEWAY_URL ?? 'http://localhost:8080';
const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

await app.register(rateLimit, { max: Number(process.env.RATE_LIMIT_MAX ?? 300), timeWindow: '1 minute' });
await app.register(fastifyStatic, { root, prefix: '/', index: false });

app.get('/health', async () => ({ status: 'ok', service: 'frontend-web' }));
app.all('/api/*', async (request, reply) => {
  const upstreamPath = request.url;
  const response = await fetch(`${apiBaseUrl}${upstreamPath}`, {
    method: request.method,
    headers: { 'content-type': request.headers['content-type'] ?? 'application/json' },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : JSON.stringify(request.body ?? {})
  });
  const body = await response.text();
  reply.status(response.status).type(response.headers.get('content-type') ?? 'application/json').send(body);
});
app.get('/*', async (_request, reply) => {
  reply.type('text/html; charset=utf-8').send(indexHtml);
});

await app.listen({ port, host });
