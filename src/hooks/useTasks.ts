import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { showToast } from '../utils/toast';

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await apiService.getTasks(projectId);
      return (response as any)?.data?.tasks || (response as any)?.tasks || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await apiService.getTask(taskId);
      return (response as any)?.data?.task || (response as any)?.data;
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast.success('Tarefa criada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao criar tarefa';
      showToast.error(message);
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => 
      apiService.updateTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      showToast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao atualizar tarefa';
      showToast.error(message);
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => apiService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast.success('Tarefa deletada com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao deletar tarefa';
      showToast.error(message);
    }
  });
}

