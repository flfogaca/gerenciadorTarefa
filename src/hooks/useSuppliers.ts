import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { showToast } from '../utils/toast';

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await apiService.getSuppliers();
      return (response as any)?.data?.suppliers || (response as any)?.suppliers || [];
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      showToast.success('Fornecedor criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao criar fornecedor';
      showToast.error(message);
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ supplierId, data }: { supplierId: string; data: any }) => 
      apiService.updateSupplier(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      showToast.success('Fornecedor atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao atualizar fornecedor';
      showToast.error(message);
    }
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (supplierId: string) => apiService.deleteSupplier(supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      showToast.success('Fornecedor deletado com sucesso!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erro ao deletar fornecedor';
      showToast.error(message);
    }
  });
}

