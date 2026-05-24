import Fastify from 'fastify';
import cors from '@fastify/cors';

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const users = [
  { id: 'user-1', name: 'Ana Silva', role: 'Product Owner' },
  { id: 'user-2', name: 'Bruno Costa', role: 'Backend Engineer' },
  { id: 'user-3', name: 'Carla Souza', role: 'Frontend Engineer' },
  { id: 'user-4', name: 'Diego Lima', role: 'DevOps Engineer' },
  { id: 'user-5', name: 'Elisa Rocha', role: 'QA Engineer' }
];

app.get('/health', async () => ({ status: 'ok', service: 'user-service' }));
app.get('/users', async () => users);
app.get<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
  const user = users.find((item) => item.id === request.params.id);
  if (!user) return reply.status(404).send({ error: 'user not found' });
  return user;
});

await app.listen({ port, host });
