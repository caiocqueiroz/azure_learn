import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type Task = { id: string; title: string; description?: string; assignedTo?: string; status: TaskStatus; createdAt: string; updatedAt: string };
type User = { id: string; name: string; role: string };
type Notification = { id: string; message: string; source: string; createdAt: string };

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('user-1');
  const [loading, setLoading] = useState(false);
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user])), [users]);

  async function loadData() {
    const [taskResponse, userResponse, notificationResponse] = await Promise.all([fetch('/api/tasks'), fetch('/api/users'), fetch('/api/notifications')]);
    setTasks(await taskResponse.json());
    setUsers(await userResponse.json());
    setNotifications(await notificationResponse.json());
  }

  async function createTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await fetch('/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, assignedTo }) });
    setTitle('');
    await loadData();
    setLoading(false);
  }

  async function updateStatus(task: Task, status: TaskStatus) {
    await fetch(`/api/tasks/${task.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    await loadData();
  }

  useEffect(() => { loadData().catch(console.error); }, []);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Azure Container Apps Lab</p>
        <h1>TaskFlow Microservices</h1>
        <p>Crie tarefas, atribua responsáveis fictícios e acompanhe eventos gerados entre microserviços.</p>
      </section>
      <section className="panel">
        <h2>Nova tarefa</h2>
        <form onSubmit={createTask} className="task-form">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título da tarefa" />
          <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <button disabled={loading}>{loading ? 'Criando...' : 'Criar tarefa'}</button>
        </form>
      </section>
      <section className="grid">
        <div className="panel">
          <h2>Tarefas</h2>
          <div className="cards">
            {tasks.map((task) => (
              <article key={task.id} className="card">
                <div>
                  <strong>{task.title}</strong>
                  <p>{userMap[task.assignedTo ?? '']?.name ?? 'Sem responsável'}</p>
                </div>
                <select value={task.status} onChange={(event) => updateStatus(task, event.target.value as TaskStatus)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Eventos recentes</h2>
          <div className="events">
            {notifications.length === 0 && <p>Nenhum evento recebido ainda.</p>}
            {notifications.map((notification) => (
              <article key={notification.id} className="event">
                <strong>{notification.message}</strong>
                <span>{notification.source} · {new Date(notification.createdAt).toLocaleString()}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
