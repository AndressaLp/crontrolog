import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '@/lib/api';
import { renderWithProviders } from '@/test/renderWithProviders';
import MinhasRotas from './index';
import type { MinhasRotasResposta } from './types';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() } };
});
const mockedApi = vi.mocked(api, true);

const resposta: MinhasRotasResposta = {
  motorista: {
    id: 'm1',
    nome: 'Marcos Oliveira',
    cnh: '67890123456',
    telefone: '(47) 99666-6666',
    status: 'ATIVO',
  },
  rotas: [
    {
      id: 'r1',
      codigo: 'RT-001',
      origem: 'Centro de Distribuição',
      destino: 'Centro, Glória',
      status: 'ATIVA',
      dataHora: '2026-10-14T08:00:00.000Z',
      coordenadasOrigem: [-26.3045, -48.8487],
      coordenadasDestino: [-26.28, -48.84],
      veiculo: { id: 'v1', placa: 'ABC-1234', modelo: 'Mercedes Sprinter' },
      entregas: [
        {
          id: 'e1',
          codigo: 'EN-001',
          destino: 'Rua das Flores, 100, Centro',
          status: 'PENDENTE',
          dataPrevista: '2026-10-14T08:00:00.000Z',
          dataEfetiva: null,
        },
        {
          id: 'e2',
          codigo: 'EN-002',
          destino: 'Rua Costa e Silva, 25, Glória',
          status: 'ENTREGUE',
          dataPrevista: '2026-10-14T08:00:00.000Z',
          dataEfetiva: '2026-10-14T10:30:00.000Z',
        },
      ],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedApi.get.mockResolvedValue({ data: resposta });
});

describe('MinhasRotas', () => {
  test('mostra as rotas atribuídas ao motorista com suas entregas', async () => {
    renderWithProviders(<MinhasRotas />);

    expect(await screen.findByText('RT-001')).toBeInTheDocument();
    expect(screen.getByText(/Marcos Oliveira/)).toBeInTheDocument();
    expect(screen.getByText(/Centro de Distribuição → Centro, Glória/)).toBeInTheDocument();
    expect(screen.getByText(/ABC-1234/)).toBeInTheDocument();
    expect(screen.getByText('EN-001')).toBeInTheDocument();
    expect(screen.getByText('EN-002')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Entregue')).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenCalledWith('/minhas-rotas', { params: { status: undefined } });
  });

  test('resumo conta rotas e entregas', async () => {
    renderWithProviders(<MinhasRotas />);

    expect(await screen.findByText(/1 rota\(s\), 2 entrega\(s\)/)).toBeInTheDocument();
  });

  test('filtrar por status refaz a consulta com o status escolhido', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MinhasRotas />);
    await screen.findByText('RT-001');

    await user.click(screen.getByRole('button', { name: 'Concluídas' }));

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith('/minhas-rotas', { params: { status: 'CONCLUIDA' } })
    );
  });

  test('motorista sem rotas vê o estado vazio', async () => {
    mockedApi.get.mockResolvedValue({ data: { ...resposta, rotas: [] } });
    renderWithProviders(<MinhasRotas />);

    expect(
      await screen.findByText('Nenhuma rota atribuída a você para este filtro.')
    ).toBeInTheDocument();
  });

  test('erro na consulta mostra mensagem de falha em vez de tela vazia', async () => {
    mockedApi.get.mockRejectedValue(new Error('falhou'));
    renderWithProviders(<MinhasRotas />);

    expect(await screen.findByText(/Não foi possível carregar suas rotas/)).toBeInTheDocument();
  });

  test('concluir uma entrega pendente chama a API e mostra o toast', async () => {
    const user = userEvent.setup();
    mockedApi.patch.mockResolvedValue({ data: { ...resposta.rotas[0].entregas[0], status: 'ENTREGUE' } });
    renderWithProviders(<MinhasRotas />);
    await screen.findByText('RT-001');

    await user.click(screen.getByRole('button', { name: 'Marcar entrega EN-001 como concluída' }));

    await waitFor(() =>
      expect(mockedApi.patch).toHaveBeenCalledWith('/minhas-rotas/entregas/e1/concluir')
    );
    expect(await screen.findByText('Entrega EN-001 concluída.')).toBeInTheDocument();
  });

  test('entrega já concluída não oferece o botão de concluir', async () => {
    renderWithProviders(<MinhasRotas />);
    await screen.findByText('RT-001');

    // EN-002 já está ENTREGUE na resposta de exemplo.
    expect(
      screen.queryByRole('button', { name: 'Marcar entrega EN-002 como concluída' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar entrega EN-001 como concluída' })).toBeInTheDocument();
  });

  test('erro ao concluir mostra a mensagem vinda do backend', async () => {
    const user = userEvent.setup();
    mockedApi.patch.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Esta entrega já foi concluída.' } },
    });
    renderWithProviders(<MinhasRotas />);
    await screen.findByText('RT-001');

    await user.click(screen.getByRole('button', { name: 'Marcar entrega EN-001 como concluída' }));

    expect(await screen.findByText('Esta entrega já foi concluída.')).toBeInTheDocument();
  });

  test('resumo conta as entregas ainda pendentes', async () => {
    renderWithProviders(<MinhasRotas />);

    expect(await screen.findByText(/2 entrega\(s\), 1 pendente\(s\)/)).toBeInTheDocument();
  });
});
