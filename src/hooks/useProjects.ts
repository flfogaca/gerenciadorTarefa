import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { showToast } from '../utils/toast';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiService.getProjects();
      return (response as any)?.data?.projects || (response as any)?.projects || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await apiService.getProject(projectId);
      return (response as any)?.data?.project || (response as any)?.data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast.success('Projeto criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao criar projeto';
      showToast.error(message);
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) => 
      apiService.updateProject(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      showToast.success('Projeto atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao atualizar projeto';
      showToast.error(message);
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => apiService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast.success('Projeto deletado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao deletar projeto';
      showToast.error(message);
    }
  });
}

