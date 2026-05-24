import Fastify from 'fastify';
import cors from '@fastify/cors';

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:8083';
const useDaprPubSub = process.env.USE_DAPR_PUBSUB === 'true';
const daprHttpPort = process.env.DAPR_HTTP_PORT ?? '3500';
const daprPubSubName = process.env.DAPR_PUBSUB_NAME ?? 'taskflow-pubsub';
const daprTopicName = process.env.DAPR_TOPIC_NAME ?? 'task-events';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type Task = { id: string; title: string; description?: string; assignedTo?: string; status: TaskStatus; createdAt: string; updatedAt: string };

type TaskEvent = { type: 'task.created' | 'task.status.updated'; task: Task; timestamp: string };

interface TaskRepository {
  list(): Task[];
  create(input: { title: string; description?: string; assignedTo?: string }): Task;
  updateStatus(id: string, status: TaskStatus): Task | undefined;
}

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [
    { id: 'task-1', title: 'Validar ingress externo do frontend', assignedTo: 'user-1', status: 'todo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'task-2', title: 'Testar service discovery interno', assignedTo: 'user-2', status: 'in-progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  list() { return this.tasks; }
  create(input: { title: string; description?: string; assignedTo?: string }) {
    const now = new Date().toISOString();
    const task: Task = { id: `task-${Date.now()}`, title: input.title, description: input.description, assignedTo: input.assignedTo, status: 'todo', createdAt: now, updatedAt: now };
    this.tasks.unshift(task);
    return task;
  }
  updateStatus(id: string, status: TaskStatus) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) return undefined;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    return task;
  }
}

const app = Fastify({ logger: true });
const repository = new InMemoryTaskRepository();
await app.register(cors, { origin: true });

function isValidStatus(status: unknown): status is TaskStatus {
  return status === 'todo' || status === 'in-progress' || status === 'done';
}

async function publishTaskEvent(event: TaskEvent) {
  try {
    if (useDaprPubSub) {
      const url = `http://localhost:${daprHttpPort}/v1.0/publish/${daprPubSubName}/${daprTopicName}`;
      const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(event) });
      if (!response.ok) throw new Error(`Dapr publish failed with ${response.status}`);
      app.log.info({ eventType: event.type, taskId: event.task.id }, 'published task event via dapr');
      return;
    }
    const response = await fetch(`${notificationServiceUrl}/notifications`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: `${event.type}: ${event.task.title}`, source: 'task-service', event }) });
    if (!response.ok) throw new Error(`HTTP notification failed with ${response.status}`);
    app.log.info({ eventType: event.type, taskId: event.task.id }, 'published task event via http');
  } catch (error) {
    app.log.error({ err: error, event }, 'failed to publish task event');
  }
}

app.get('/health', async () => ({ status: 'ok', service: 'task-service' }));
app.get('/tasks', async () => repository.list());
app.post('/tasks', async (request, reply) => {
  const body = request.body as Partial<Task>;
  if (!body?.title || typeof body.title !== 'string') return reply.status(400).send({ error: 'title is required' });
  const task = repository.create({ title: body.title, description: body.description, assignedTo: body.assignedTo });
  await publishTaskEvent({ type: 'task.created', task, timestamp: new Date().toISOString() });
  return reply.status(201).send(task);
});
app.patch<{ Params: { id: string } }>('/tasks/:id/status', async (request, reply) => {
  const body = request.body as { status?: unknown };
  if (!isValidStatus(body?.status)) return reply.status(400).send({ error: 'status must be todo, in-progress or done' });
  const task = repository.updateStatus(request.params.id, body.status);
  if (!task) return reply.status(404).send({ error: 'task not found' });
  await publishTaskEvent({ type: 'task.status.updated', task, timestamp: new Date().toISOString() });
  return task;
});

await app.listen({ port, host });
