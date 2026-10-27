import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AcessoMotoristaInput, Motorista } from './types';

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});

interface Props {
  motorista: Motorista | null;
  onClose: () => void;
  onSave: (data: AcessoMotoristaInput) => void;
  saving?: boolean;
}

export default function MotoristaAcessoModal({ motorista, onClose, onSave, saving }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcessoMotoristaInput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({ email: '', senha: '' });
  }, [motorista, reset]);

  return (
    <Dialog open={!!motorista} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar acesso — {motorista?.nome}</DialogTitle>
          <DialogDescription>
            O motorista entra com esses dados e passa a ver apenas as rotas atribuídas a ele.
            Informe a senha inicial a ele por um canal seguro; ele pode trocá-la depois em
            "Esqueci minha senha".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="acesso-email">E-mail de acesso</Label>
            <Input
              id="acesso-email"
              type="email"
              autoComplete="off"
              placeholder="motorista@empresa.com"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="acesso-senha">Senha inicial</Label>
            <Input
              id="acesso-senha"
              type="password"
              autoComplete="new-password"
              placeholder="Ao menos 8 caracteres"
              {...register('senha')}
            />
            {errors.senha && <p className="text-xs text-red-600">{errors.senha.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Criando...' : 'Criar acesso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
