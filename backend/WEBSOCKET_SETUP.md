# WebSocket Setup - Backend

Este documento descreve como configurar o WebSocket no backend para suportar notificações em tempo real.

## Instalação

```bash
npm install socket.io
```

## Implementação

### 1. Configurar Socket.IO no servidor principal

```typescript
// backend/src/index.ts ou backend/src/server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const tenantId = socket.handshake.auth.tenantId;

  if (!token || !tenantId) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = decoded;
    socket.data.tenantId = tenantId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const tenantId = socket.data.tenantId;
  const userId = socket.data.user.userId;
  
  socket.join(`tenant:${tenantId}`);
  socket.join(`user:${userId}`);

  console.log(`User ${userId} connected to tenant ${tenantId}`);

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

export { io };

httpServer.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### 2. Emitir notificações

```typescript
// backend/src/infrastructure/websocket/notification.service.ts
import { io } from '../index';

export class WebSocketNotificationService {
  emitNotification(userId: string, tenantId: string, notification: any) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  emitToTenant(tenantId: string, event: string, data: any) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }

  emitTaskUpdate(tenantId: string, task: any) {
    io.to(`tenant:${tenantId}`).emit('task:updated', task);
  }

  emitProjectUpdate(tenantId: string, project: any) {
    io.to(`tenant:${tenantId}`).emit('project:updated', project);
  }

  emitTaskCreated(tenantId: string, task: any) {
    io.to(`tenant:${tenantId}`).emit('task:created', task);
  }

  emitProjectCreated(tenantId: string, project: any) {
    io.to(`tenant:${tenantId}`).emit('project:created', project);
  }
}

export const wsNotificationService = new WebSocketNotificationService();
```

### 3. Integrar com serviços existentes

```typescript
// Exemplo: backend/src/application/services/task.service.ts
import { wsNotificationService } from '../../infrastructure/websocket/notification.service';

export class TaskService {
  async updateTask(taskId: string, data: any, tenantId: string) {
    const task = await this.taskRepository.update(taskId, data);
    
    wsNotificationService.emitTaskUpdate(tenantId, task);
    
    return task;
  }

  async createTask(data: any, tenantId: string) {
    const task = await this.taskRepository.create(data);
    
    wsNotificationService.emitTaskCreated(tenantId, task);
    
    return task;
  }
}
```

## Eventos Suportados

- `notification` - Notificação genérica
- `task:updated` - Tarefa atualizada
- `task:created` - Tarefa criada
- `project:updated` - Projeto atualizado
- `project:created` - Projeto criado

## Variáveis de Ambiente

```env
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

## Testes

Para testar a conexão WebSocket, você pode usar o cliente Socket.IO:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
    tenantId: 'your-tenant-id'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('notification', (data) => {
  console.log('Notification received:', data);
});
```

