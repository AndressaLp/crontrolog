import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EntregaDaRota, MinhasRotasResposta, StatusRota } from './types';

export function useMinhasRotas(status?: StatusRota) {
  return useQuery({
    queryKey: ['minhas-rotas', status ?? 'todas'],
    queryFn: async () =>
      (await api.get<MinhasRotasResposta>('/minhas-rotas', { params: { status } })).data,
  });
}

export function useConcluirEntrega() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entregaId: string) =>
      (await api.patch<EntregaDaRota>(`/minhas-rotas/entregas/${entregaId}/concluir`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['minhas-rotas'] }),
  });
}
