import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMotoristas } from '@/pages/Motoristas/api';
import { useVeiculos } from '@/pages/Veiculos/api';
import type { Rota } from '@/pages/Rotas/types';

interface Props {
  rota: Rota | null;
  onClose: () => void;
  onSave: (data: { motoristaId: string; veiculoId: string }) => void;
  saving?: boolean;
}

export default function AtribuirModal({ rota, onClose, onSave, saving }: Props) {
  const [rotaId, setRotaId] = useState(rota?.id);
  const [motoristaId, setMotoristaId] = useState(rota?.motorista.id ?? '');
  const [veiculoId, setVeiculoId] = useState(rota?.veiculo.id ?? '');

  // Abrir o modal para outra rota recomeça a seleção do zero. Ajuste em render
  // (padrão do React para estado derivado de prop) em vez de useEffect, que
  // renderizaria uma vez com a seleção da rota anterior antes de corrigir.
  if (rota?.id !== rotaId) {
    setRotaId(rota?.id);
    setMotoristaId(rota?.motorista.id ?? '');
    setVeiculoId(rota?.veiculo.id ?? '');
  }

  // Só motoristas ATIVOS podem receber uma rota — um motorista inativo não
  // está disponível para operar, então nem aparece como opção.
  const { data: motoristasData } = useMotoristas({ status: 'ATIVO', pageSize: 100 });
  const { data: veiculosData } = useVeiculos({ pageSize: 100 });

  const motoristas = motoristasData?.items ?? [];
  const veiculos = veiculosData?.items ?? [];
  const semMudanca = motoristaId === rota?.motorista.id && veiculoId === rota?.veiculo.id;

  return (
    <Dialog open={!!rota} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atribuir {rota?.codigo}</DialogTitle>
          <DialogDescription>
            {rota?.entregasPendentes
              ? `Esta rota tem ${rota.entregasPendentes} entrega(s) pendente(s) — elas passam junto para o novo motorista.`
              : 'Escolha o motorista e o veículo responsáveis por esta rota.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="atribuir-motorista">Motorista</Label>
            <Select value={motoristaId} onValueChange={setMotoristaId}>
              <SelectTrigger id="atribuir-motorista" className="w-full">
                <SelectValue placeholder="Selecione o motorista" />
              </SelectTrigger>
              <SelectContent>
                {motoristas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome}
                    {m.emRota ? ' — já em rota' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="atribuir-veiculo">Veículo</Label>
            <Select value={veiculoId} onValueChange={setVeiculoId}>
              <SelectTrigger id="atribuir-veiculo" className="w-full">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} — {v.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={saving || semMudanca || !motoristaId || !veiculoId}
            onClick={() => onSave({ motoristaId, veiculoId })}
          >
            {saving ? 'Salvando...' : 'Salvar atribuição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
