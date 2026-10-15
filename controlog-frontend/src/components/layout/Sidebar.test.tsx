import { beforeEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from './Sidebar';

beforeEach(() => {
  useAuthStore.setState({ usuario: null, accessToken: null, refreshToken: null });
});

describe('Sidebar', () => {
  test('renderiza um link de navegação para cada módulo', () => {
    render(
      <MemoryRouter initialEntries={['/motoristas']}>
        <Sidebar />
      </MemoryRouter>
    );

    for (const label of [
      'Dashboard',
      'Entregas',
      'Veículos',
      'Motoristas',
      'Rotas',
      'Otimização de Rotas',
      'Pedidos',
      'Planos',
      'Relatórios',
    ]) {
      // Âncoras no regex evitam que "Rotas" combine com "Otimização de Rotas".
      expect(screen.getByRole('link', { name: new RegExp(`^${label}$`) })).toBeInTheDocument();
    }
  });

  test('motorista vê só "Minhas Rotas", sem os módulos de gestão', () => {
    useAuthStore.setState({
      usuario: { id: 'u1', nome: 'Marcos', email: 'marcos@controlog.com', perfil: 'MOTORISTA' },
    });

    render(
      <MemoryRouter initialEntries={['/minhas-rotas']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^Minhas Rotas$/ })).toBeInTheDocument();
    for (const label of ['Dashboard', 'Motoristas', 'Planos', 'Relatórios']) {
      expect(screen.queryByRole('link', { name: new RegExp(`^${label}$`) })).not.toBeInTheDocument();
    }
  });

  test('gestor não vê o link da visão restrita do motorista', () => {
    useAuthStore.setState({
      usuario: { id: 'u1', nome: 'Ricardo', email: 'gestor@controlog.com', perfil: 'GESTOR' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^Dashboard$/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Minhas Rotas$/ })).not.toBeInTheDocument();
  });

  test('marca o link da rota atual como ativo', () => {
    render(
      <MemoryRouter initialEntries={['/motoristas']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^Motoristas$/ })).toHaveClass('bg-blue-600');
    expect(screen.getByRole('link', { name: /^Rotas$/ })).not.toHaveClass('bg-blue-600');
  });
});
