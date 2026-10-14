import { ForbiddenError } from '../utils/AppError.js';

// Visão restrita do motorista logado: só as rotas atribuídas a ele, cada uma
// com as próprias entregas. É somente leitura — o motorista recebe e consulta
// o trabalho do dia, mas cadastro e alteração seguem sendo de gestor/operador.
export function createMinhasRotasService(prisma) {
  return {
    async listar(usuarioId, { status } = {}) {
      const motorista = await prisma.motorista.findUnique({ where: { usuarioId } });
      // Usuário com perfil MOTORISTA mas sem cadastro de motorista vinculado:
      // só acontece se o vínculo for desfeito no banco depois do login, então
      // é 403 (token válido, mas não dá acesso a nada) e não 404.
      if (!motorista) {
        throw new ForbiddenError('Este usuário não está vinculado a um cadastro de motorista.');
      }

      const rotas = await prisma.rota.findMany({
        where: { motoristaId: motorista.id, status: status ?? undefined },
        include: {
          veiculo: { select: { id: true, placa: true, modelo: true } },
          entregas: {
            orderBy: { codigo: 'asc' },
            select: {
              id: true,
              codigo: true,
              destino: true,
              status: true,
              dataPrevista: true,
              dataEfetiva: true,
            },
          },
        },
        orderBy: { dataHora: 'desc' },
      });

      return {
        motorista: {
          id: motorista.id,
          nome: motorista.nome,
          cnh: motorista.cnh,
          telefone: motorista.telefone,
          status: motorista.status,
        },
        rotas: rotas.map((rota) => ({
          id: rota.id,
          codigo: rota.codigo,
          origem: rota.origem,
          destino: rota.destino,
          status: rota.status,
          dataHora: rota.dataHora,
          coordenadasOrigem: [rota.latOrigem, rota.lngOrigem],
          coordenadasDestino: [rota.latDestino, rota.lngDestino],
          veiculo: rota.veiculo,
          entregas: rota.entregas,
        })),
      };
    },
  };
}
