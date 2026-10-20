import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PackageCheck, Route, Users } from 'lucide-react';
import { LogoSimbolo, LogoTexto } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/lib/api';
import { rotaInicialPorPerfil } from '@/lib/perfil';

const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * O que a plataforma entrega, para quem chega na tela sem conhecer o produto.
 * São capacidades que existem de fato no sistema — não métricas de operação,
 * que seriam invenção num projeto sem histórico de produção.
 */
const RECURSOS = [
  {
    icone: Route,
    titulo: 'Rotas otimizadas',
    descricao: 'Melhor ordem de entrega e traçado real pelas ruas',
  },
  {
    icone: PackageCheck,
    titulo: 'Entregas rastreadas',
    descricao: 'Do pendente ao concluído, com data efetiva',
  },
  {
    icone: Users,
    titulo: 'Equipe e frota',
    descricao: 'Motoristas, veículos e atribuição de rotas',
  },
] as const;

export default function Login() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const usuario = useAuthStore((s) => s.usuario);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (accessToken) {
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from ?? rotaInicialPorPerfil(usuario?.perfil)} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data.email, data.senha);
      // O perfil só é conhecido depois do login, por isso lido do store em vez
      // do `usuario` capturado no render — um motorista cai direto na visão
      // dele, que é a única página que o perfil abre.
      const perfil = useAuthStore.getState().usuario?.perfil;
      navigate(rotaInicialPorPerfil(perfil), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'E-mail ou senha inválidos.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Painel da marca ──
          Escondido abaixo de lg: numa tela estreita ele empurraria o
          formulário para fora da primeira dobra, que é o que importa aqui. */}
      <section className="hidden lg:flex lg:w-3/5 flex-col justify-between bg-gradient-to-br from-[#172554] via-[#1e40af] to-[#2563eb] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <LogoSimbolo tema="azul" className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <LogoTexto tema="azul" className="text-lg" />
            <p className="text-xs text-blue-200">Sistema de Gestão Logística</p>
          </div>
        </div>

        <div className="max-w-xl">
          {/* Chamada de capa, não estrutura do documento — o h1 da página é o
              do formulário, que é o que a pessoa veio fazer aqui. */}
          <p className="text-5xl font-bold leading-[1.1] tracking-tight">
            Gerencie sua
            <br />
            <span className="text-blue-300">operação logística</span>
            <br />
            de ponta a ponta
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
            Planeje rotas, acompanhe entregas e controle a frota num fluxo único — no lugar de
            planilhas soltas e mensagens de WhatsApp.
          </p>

          <ul className="mt-10 grid grid-cols-3 gap-4">
            {RECURSOS.map(({ icone: Icone, titulo, descricao }) => (
              <li
                key={titulo}
                className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
              >
                <Icone size={20} className="text-blue-200" aria-hidden="true" />
                <p className="mt-3 font-semibold leading-tight">{titulo}</p>
                <p className="mt-1 text-xs leading-snug text-blue-200">{descricao}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-blue-200/80">© 2026 Controlog</p>
      </section>

      {/* ── Formulário ── */}
      <main className="flex w-full items-center justify-center bg-white px-4 py-12 lg:w-2/5">
        <div className="w-full max-w-sm">
          {/* A marca só se repete aqui quando o painel da esquerda não aparece. */}
          <div className="mb-6 flex flex-col items-center gap-2 text-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <LogoSimbolo tema="azul" className="h-7 w-7" />
            </div>
            <LogoTexto tema="claro" className="text-xl" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-gray-600">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@empresa.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="senha">Senha</Label>
              <Link to="/esqueci-senha" className="text-xs font-medium text-blue-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('senha')}
            />
            {errors.senha && <p className="text-xs text-red-600">{errors.senha.message}</p>}
          </div>

            {/* Azul explícito: o `default` do shadcn é preto, mas toda ação
                primária do sistema (ex.: "Novo Veículo") usa o azul da marca. */}
            <Button
              type="submit"
              className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600">
            Login de teste: gestor@controlog.com / controlog123
          </p>
        </div>
      </main>
    </div>
  );
}
