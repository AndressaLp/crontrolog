import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MinhasRotasResposta, StatusRota } from './types';

export function useMinhasRotas(status?: StatusRota) {
  return useQuery({
    queryKey: ['minhas-rotas', status ?? 'todas'],
    queryFn: async () =>
      (await api.get<MinhasRotasResposta>('/minhas-rotas', { params: { status } })).data,
  });
}
