import Fastify from 'fastify';
import cors from '@fastify/cors';

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const taskServiceUrl = process.env.TASK_SERVICE_URL ?? 'http://localhost:8081';
const userServiceUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:8082';
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:8083';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

async function proxy<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const error = new Error(`Upstream request failed: ${response.status}`);
    (error as Error & { statusCode?: number; body?: unknown }).statusCode = response.status;
    (error as Error & { statusCode?: number; body?: unknown }).body = body;
    throw error;
  }
  return body as T;
}

app.get('/health', async () => ({ status: 'ok', service: 'api-gateway' }));
app.get('/api/tasks', async () => proxy(taskServiceUrl, '/tasks'));
app.post('/api/tasks', async (request) => proxy(taskServiceUrl, '/tasks', { method: 'POST', body: JSON.stringify(request.body ?? {}) }));
app.patch<{ Params: { id: string } }>('/api/tasks/:id/status', async (request) => proxy(taskServiceUrl, `/tasks/${request.params.id}/status`, { method: 'PATCH', body: JSON.stringify(request.body ?? {}) }));
app.get('/api/users', async () => proxy(userServiceUrl, '/users'));
app.get('/api/notifications', async () => proxy(notificationServiceUrl, '/notifications'));

app.setErrorHandler((error, _request, reply) => {
  const upstream = error as Error & { statusCode?: number; body?: unknown };
  app.log.error({ err: error, upstreamBody: upstream.body }, 'request failed');
  reply.status(upstream.statusCode ?? 500).send(upstream.body ?? { error: upstream.message });
});

await app.listen({ port, host });
