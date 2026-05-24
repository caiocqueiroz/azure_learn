import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const apiBaseUrl = process.env.API_GATEWAY_URL ?? 'http://localhost:8080';
const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };

await app.register(rateLimit, { max: Number(process.env.RATE_LIMIT_MAX ?? 300), timeWindow: '1 minute' });

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
app.get('/*', async (request, reply) => {
  const requestedPath = normalize(request.url.split('?')[0]).replace(/^\.\.(\/|\\|$)/, '');
  const candidate = join(root, requestedPath === '/' ? 'index.html' : requestedPath);
  const file = existsSync(candidate) ? candidate : join(root, 'index.html');
  reply.type(contentTypes[extname(file)] ?? 'application/octet-stream').send(createReadStream(file));
});

await app.listen({ port, host });
