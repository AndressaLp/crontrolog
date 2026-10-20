import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut, PanelLeftClose, PanelLeftOpen, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const pageTitles: Record<string, string> = {
  '/':              'Dashboard',
  '/entregas':      'Entregas',
  '/veiculos':      'Veículos',
  '/motoristas':    'Motoristas',
  '/rotas':         'Rotas',
  '/atribuicoes':   'Atribuição de Rotas',
  '/relatorios':    'Relatórios',
  '/minhas-rotas':  'Minhas Rotas',
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const recolhida = useUiStore((s) => s.sidebarRecolhida)
  const alternarSidebar = useUiStore((s) => s.alternarSidebar)
  const title = pageTitles[pathname] ?? 'Controlog'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={alternarSidebar}
          aria-label={recolhida ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-expanded={!recolhida}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          {recolhida ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notificações */}
        <button aria-label="Notificações" className="relative text-gray-500 hover:text-gray-800 transition-colors">
          <Bell size={20} />
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserCircle size={28} className="text-gray-400" />
          <div className="leading-tight">
            <p className="font-medium">{usuario?.nome ?? 'Usuário'}</p>
            <p className="text-xs text-gray-600">{usuario?.perfil}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair"
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
