export type StatusMotorista = 'ATIVO' | 'INATIVO'

export interface Motorista {
  id: string
  nome: string
  cnh: string
  telefone: string
  status: StatusMotorista
  emRota: boolean
  entregasRealizadas: number
  criadoEm: string
  /** E-mail de login do motorista, ou null se ele ainda não tem acesso. */
  acessoEmail: string | null
}

export interface AcessoMotoristaInput {
  email: string
  senha: string
}

export interface MotoristaInput {
  nome: string
  cnh: string
  telefone: string
  status?: StatusMotorista
}
