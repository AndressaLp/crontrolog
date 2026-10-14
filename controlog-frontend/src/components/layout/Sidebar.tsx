import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PackageCheck,
  Truck,
  Users,
  MapPin,
  Route,
  Package,
  ClipboardList,
  BarChart2,
} from 'lucide-react'
import { PERFIS_GESTAO, type Perfil } from '@/lib/perfil'
import { useAuthStore } from '@/stores/authStore'

const navItems: { to: string; icon: typeof Truck; label: string; perfis: Perfil[] }[] = [
  { to: '/minhas-rotas',      icon: MapPin,          label: 'Minhas Rotas',        perfis: ['MOTORISTA'] },
  { to: '/',                  icon: LayoutDashboard, label: 'Dashboard',           perfis: PERFIS_GESTAO },
  { to: '/entregas',          icon: PackageCheck,    label: 'Entregas',            perfis: PERFIS_GESTAO },
  { to: '/veiculos',          icon: Truck,           label: 'Veículos',            perfis: PERFIS_GESTAO },
  { to: '/motoristas',        icon: Users,           label: 'Motoristas',          perfis: PERFIS_GESTAO },
  { to: '/rotas',             icon: MapPin,          label: 'Rotas',               perfis: PERFIS_GESTAO },
  { to: '/otimizacao-rotas',  icon: Route,           label: 'Otimização de Rotas', perfis: PERFIS_GESTAO },
  { to: '/pedidos',           icon: Package,         label: 'Pedidos',             perfis: PERFIS_GESTAO },
  { to: '/planos',            icon: ClipboardList,   label: 'Planos',              perfis: PERFIS_GESTAO },
  { to: '/relatorios',        icon: BarChart2,       label: 'Relatórios',          perfis: PERFIS_GESTAO },
]

export default function Sidebar() {
  const perfil = useAuthStore((s) => s.usuario?.perfil)
  // Sem perfil carregado, mostra o menu de gestão (comportamento de antes) —
  // o acesso em si é barrado pelo RequireAuth e pelo backend, não pelo menu.
  const itens = navItems.filter((item) => item.perfis.includes(perfil ?? 'OPERADOR'))

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <span className="text-xl font-bold tracking-wide text-blue-400">
          🚚 Controlog
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {itens.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
        Controlog v1.0
      </div>
    </aside>
  )
}
