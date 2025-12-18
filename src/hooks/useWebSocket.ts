import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wsService } from '../services/websocket';
import { showToast } from '../utils/toast';

export function useWebSocket() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      const tenantId = localStorage.getItem('tenantId');
      
      if (token && tenantId) {
        wsService.connect(token, tenantId);

        const handleNotification = (event: CustomEvent) => {
          const notification = event.detail;
          if (notification?.message) {
            showToast.info(notification.message);
          }
        };

        const handleTaskUpdated = (event: CustomEvent) => {
          const task = event.detail;
          if (task?.title) {
            showToast.info(`Tarefa "${task.title}" foi atualizada`);
          }
        };

        const handleProjectUpdated = (event: CustomEvent) => {
          const project = event.detail;
          if (project?.name) {
            showToast.info(`Projeto "${project.name}" foi atualizado`);
          }
        };

        window.addEventListener('websocket:notification', handleNotification as EventListener);
        window.addEventListener('websocket:task:updated', handleTaskUpdated as EventListener);
        window.addEventListener('websocket:project:updated', handleProjectUpdated as EventListener);

        return () => {
          wsService.disconnect();
          window.removeEventListener('websocket:notification', handleNotification as EventListener);
          window.removeEventListener('websocket:task:updated', handleTaskUpdated as EventListener);
          window.removeEventListener('websocket:project:updated', handleProjectUpdated as EventListener);
        };
      }
    }
  }, [user]);

  return {
    isConnected: wsService.isConnected(),
    emit: wsService.emitEvent.bind(wsService)
  };
}

