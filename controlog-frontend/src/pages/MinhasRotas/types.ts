export type StatusRota = 'ATIVA' | 'CONCLUIDA' | 'CANCELADA'
export type StatusEntrega = 'PENDENTE' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADA'

export interface EntregaDaRota {
  id: string
  codigo: string
  destino: string
  status: StatusEntrega
  dataPrevista: string
  dataEfetiva: string | null
}

export interface MinhaRota {
  id: string
  codigo: string
  origem: string
  destino: string
  status: StatusRota
  dataHora: string
  coordenadasOrigem: [number, number]
  coordenadasDestino: [number, number]
  veiculo: { id: string; placa: string; modelo: string }
  entregas: EntregaDaRota[]
}

export interface MinhasRotasResposta {
  motorista: {
    id: string
    nome: string
    cnh: string
    telefone: string
    status: 'ATIVO' | 'INATIVO'
  }
  rotas: MinhaRota[]
}
