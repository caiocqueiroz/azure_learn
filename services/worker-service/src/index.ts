import Fastify from 'fastify';

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';
const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 10000);
const workerName = process.env.WORKER_NAME ?? 'taskflow-worker';
const app = Fastify({ logger: true });
let processedBatches = 0;

app.get('/health', async () => ({ status: 'ok', service: 'worker-service', processedBatches }));

setInterval(() => {
  processedBatches += 1;
  app.log.info({ workerName, processedBatches, intervalMs, simulatedItems: Math.floor(Math.random() * 5) + 1 }, 'simulated async task processing');
}, intervalMs);

await app.listen({ port, host });
