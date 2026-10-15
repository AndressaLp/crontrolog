import type { Usuario } from '@/stores/authStore';

export type Perfil = Usuario['perfil'];

export const PERFIS_GESTAO: Perfil[] = ['GESTOR', 'OPERADOR'];

// O motorista não tem acesso a nenhuma tela de gestão, então o "início" dele é
// a própria visão restrita — usado tanto no pós-login quanto ao barrar uma
// rota que o perfil não pode abrir.
export function rotaInicialPorPerfil(perfil: Perfil | undefined): string {
  return perfil === 'MOTORISTA' ? '/minhas-rotas' : '/';
}
