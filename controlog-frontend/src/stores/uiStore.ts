import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  /** Sidebar recolhida mostra só os ícones, liberando ~192px para o conteúdo. */
  sidebarRecolhida: boolean;
  alternarSidebar: () => void;
}

/**
 * Preferências de interface que sobrevivem ao recarregamento. Fica separado do
 * authStore de propósito: o logout limpa credenciais, e não faria sentido
 * desfazer junto a escolha de layout de quem estava usando o sistema.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarRecolhida: false,
      alternarSidebar: () => set((estado) => ({ sidebarRecolhida: !estado.sidebarRecolhida })),
    }),
    { name: 'controlog-ui' }
  )
);
