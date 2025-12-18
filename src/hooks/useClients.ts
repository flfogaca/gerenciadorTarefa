import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { showToast } from '../utils/toast';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiService.getClients();
      return (response as any)?.data?.clients || (response as any)?.clients || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao criar cliente';
      showToast.error(message);
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: any }) => 
      apiService.updateClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao atualizar cliente';
      showToast.error(message);
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientId: string) => apiService.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast.success('Cliente deletado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao deletar cliente';
      showToast.error(message);
    }
  });
}

