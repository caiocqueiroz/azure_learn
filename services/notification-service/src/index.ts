import Fastify from 'fastify';
import cors from '@fastify/cors';

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const maxNotifications = Number(process.env.MAX_NOTIFICATIONS ?? 50);

type Notification = { id: string; message: string; source: string; event?: unknown; createdAt: string };
const notifications: Notification[] = [];
const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

function addNotification(input: { message?: string; source?: string; event?: unknown }) {
  const notification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message: input.message ?? 'Task event received',
    source: input.source ?? 'unknown',
    event: input.event,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(notification);
  notifications.splice(maxNotifications);
  app.log.info({ notification }, 'notification stored');
  return notification;
}

app.get('/health', async () => ({ status: 'ok', service: 'notification-service' }));
app.get('/notifications', async () => notifications);
app.post('/notifications', async (request, reply) => reply.status(201).send(addNotification(request.body as { message?: string; source?: string; event?: unknown })));
app.get('/dapr/subscribe', async () => [{ pubsubname: process.env.DAPR_PUBSUB_NAME ?? 'taskflow-pubsub', topic: process.env.DAPR_TOPIC_NAME ?? 'task-events', route: '/events/task-events' }]);
app.post('/events/task-events', async (request, reply) => {
  const cloudEvent = request.body as { data?: unknown; source?: string; type?: string };
  const event = cloudEvent?.data ?? cloudEvent;
  return reply.status(201).send(addNotification({ message: `Dapr event received: ${cloudEvent?.type ?? 'task-event'}`, source: cloudEvent?.source ?? 'dapr-pubsub', event }));
});

await app.listen({ port, host });
