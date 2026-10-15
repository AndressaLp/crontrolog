import { jest } from '@jest/globals';
import { createMotoristaService } from '../src/services/motorista.service.js';
import { ConflictError, NotFoundError } from '../src/utils/AppError.js';

function buildPrismaMock() {
  const tx = {
    usuario: { create: jest.fn() },
    motorista: { update: jest.fn() },
  };

  return {
    motorista: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    usuario: { findUnique: jest.fn() },
    rota: { count: jest.fn() },
    entrega: { count: jest.fn() },
    $transaction: jest.fn(async (fn) => fn(tx)),
    _tx: tx,
  };
}

describe('motorista.service', () => {
  test('create cria motorista com status padrão ATIVO', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.create.mockResolvedValue({
      id: 'm1',
      nome: 'Carlos Silva',
      cnh: '12345678901',
      telefone: '(47) 99111-1111',
      status: 'ATIVO',
      criadoEm: new Date(),
    });

    const service = createMotoristaService(prisma);
    const motorista = await service.create({
      nome: 'Carlos Silva',
      cnh: '12345678901',
      telefone: '(47) 99111-1111',
    });

    expect(motorista.status).toBe('ATIVO');
    expect(motorista.emRota).toBe(false);
  });

  // RN03 — Não é possível excluir um motorista que possui rotas ativas vinculadas
  test('remove bloqueia exclusão quando há rota ativa vinculada', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({ id: 'm1' });
    prisma.rota.count.mockResolvedValue(1);

    const service = createMotoristaService(prisma);

    await expect(service.remove('m1')).rejects.toBeInstanceOf(ConflictError);
    expect(prisma.motorista.delete).not.toHaveBeenCalled();
  });

  test('remove permite exclusão quando não há rota ativa vinculada', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({ id: 'm1' });
    prisma.rota.count.mockResolvedValue(0);
    prisma.motorista.delete.mockResolvedValue({ id: 'm1' });

    const service = createMotoristaService(prisma);

    await expect(service.remove('m1')).resolves.toBeUndefined();
    expect(prisma.motorista.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });

  test('remove lança NotFoundError para motorista inexistente', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue(null);

    const service = createMotoristaService(prisma);

    await expect(service.remove('inexistente')).rejects.toBeInstanceOf(NotFoundError);
  });

  test('list aplica filtros de busca e status e calcula emRota por motorista', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findMany.mockResolvedValue([
      { id: 'm1', nome: 'Carlos Silva', cnh: '1', telefone: '1', status: 'ATIVO', criadoEm: new Date() },
    ]);
    prisma.motorista.count.mockResolvedValue(1);
    prisma.rota.count.mockResolvedValue(1);
    prisma.entrega.count.mockResolvedValue(3);

    const service = createMotoristaService(prisma);
    const resultado = await service.list({ busca: 'carlos', status: 'ATIVO' });

    expect(prisma.motorista.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ATIVO' }) })
    );
    expect(resultado.items).toEqual([
      expect.objectContaining({ id: 'm1', emRota: true, entregasRealizadas: 3 }),
    ]);
    expect(resultado.pagination).toEqual({ page: 1, pageSize: 10, total: 1, totalPages: 1 });
  });

  test('list filtra por emRota usando a relação rotas', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findMany.mockResolvedValue([]);
    prisma.motorista.count.mockResolvedValue(0);

    const service = createMotoristaService(prisma);
    await service.list({ emRota: true });

    expect(prisma.motorista.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ rotas: { some: { status: 'ATIVA' } } }),
      })
    );
  });

  test('list pagina com page e pageSize informados', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findMany.mockResolvedValue([]);
    prisma.motorista.count.mockResolvedValue(25);

    const service = createMotoristaService(prisma);
    const resultado = await service.list({ page: 2, pageSize: 10 });

    expect(prisma.motorista.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
    expect(resultado.pagination).toEqual({ page: 2, pageSize: 10, total: 25, totalPages: 3 });
  });

  test('getById lança NotFoundError quando motorista não existe', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue(null);

    const service = createMotoristaService(prisma);

    await expect(service.getById('inexistente')).rejects.toBeInstanceOf(NotFoundError);
  });

  test('update lança NotFoundError quando motorista não existe', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue(null);

    const service = createMotoristaService(prisma);

    await expect(service.update('inexistente', { nome: 'Novo Nome' })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  test('update altera dados do motorista existente', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique
      .mockResolvedValueOnce({ id: 'm1', nome: 'Carlos Silva' })
      .mockResolvedValueOnce({
        id: 'm1',
        nome: 'Carlos S. Silva',
        cnh: '1',
        telefone: '1',
        status: 'ATIVO',
        criadoEm: new Date(),
      });
    prisma.motorista.update.mockResolvedValue({ id: 'm1' });
    prisma.rota.count.mockResolvedValue(0);
    prisma.entrega.count.mockResolvedValue(0);

    const service = createMotoristaService(prisma);
    const motorista = await service.update('m1', { nome: 'Carlos S. Silva' });

    expect(motorista.nome).toBe('Carlos S. Silva');
  });

  test('criarAcesso cria usuário MOTORISTA e vincula ao motorista', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique
      .mockResolvedValueOnce({ id: 'm1', nome: 'Marcos Oliveira', usuarioId: null })
      .mockResolvedValueOnce({
        id: 'm1',
        nome: 'Marcos Oliveira',
        cnh: '1',
        telefone: '1',
        status: 'ATIVO',
        criadoEm: new Date(),
        usuario: { email: 'marcos@controlog.com' },
      });
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma._tx.usuario.create.mockResolvedValue({ id: 'u1' });
    prisma.rota.count.mockResolvedValue(0);
    prisma.entrega.count.mockResolvedValue(0);

    const service = createMotoristaService(prisma);
    const motorista = await service.criarAcesso('m1', {
      email: 'marcos@controlog.com',
      senha: 'senha12345',
    });

    expect(prisma._tx.usuario.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nome: 'Marcos Oliveira',
        email: 'marcos@controlog.com',
        perfil: 'MOTORISTA',
      }),
    });
    // A senha nunca é gravada em texto puro.
    expect(prisma._tx.usuario.create.mock.calls[0][0].data.senhaHash).not.toBe('senha12345');
    expect(prisma._tx.motorista.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { usuarioId: 'u1' },
    });
    expect(motorista.acessoEmail).toBe('marcos@controlog.com');
  });

  test('criarAcesso rejeita motorista que já tem acesso', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({ id: 'm1', nome: 'Marcos', usuarioId: 'u1' });

    const service = createMotoristaService(prisma);

    await expect(
      service.criarAcesso('m1', { email: 'x@y.com', senha: 'senha12345' })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('criarAcesso rejeita e-mail já usado por outro usuário', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({ id: 'm1', nome: 'Marcos', usuarioId: null });
    prisma.usuario.findUnique.mockResolvedValue({ id: 'u9', email: 'x@y.com' });

    const service = createMotoristaService(prisma);

    await expect(
      service.criarAcesso('m1', { email: 'x@y.com', senha: 'senha12345' })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('criarAcesso lança NotFoundError para motorista inexistente', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue(null);

    const service = createMotoristaService(prisma);

    await expect(
      service.criarAcesso('inexistente', { email: 'x@y.com', senha: 'senha12345' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test('getById expõe acessoEmail null quando o motorista não tem login', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({
      id: 'm1',
      nome: 'Carlos Silva',
      cnh: '1',
      telefone: '1',
      status: 'ATIVO',
      criadoEm: new Date(),
      usuario: null,
    });
    prisma.rota.count.mockResolvedValue(0);
    prisma.entrega.count.mockResolvedValue(0);

    const service = createMotoristaService(prisma);
    const motorista = await service.getById('m1');

    expect(motorista.acessoEmail).toBeNull();
  });

  test('getById calcula emRota=true quando existe rota ativa', async () => {
    const prisma = buildPrismaMock();
    prisma.motorista.findUnique.mockResolvedValue({
      id: 'm1',
      nome: 'Carlos Silva',
      cnh: '12345678901',
      telefone: '(47) 99111-1111',
      status: 'ATIVO',
      criadoEm: new Date(),
    });
    prisma.rota.count.mockResolvedValue(2);
    prisma.entrega.count.mockResolvedValue(5);

    const service = createMotoristaService(prisma);
    const motorista = await service.getById('m1');

    expect(motorista.emRota).toBe(true);
    expect(motorista.entregasRealizadas).toBe(5);
  });
});
