import { describe, expect, test, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render } from '@testing-library/react';
import RequireAuth from './RequireAuth';
import { useAuthStore } from '@/stores/authStore';

function renderApp(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<div>Área protegida</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function renderAppComPerfis(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Tela de Login</div>} />
        <Route element={<RequireAuth perfis={['GESTOR', 'OPERADOR']} />}>
          <Route path="/" element={<div>Área de gestão</div>} />
        </Route>
        <Route element={<RequireAuth perfis={['MOTORISTA']} />}>
          <Route path="/minhas-rotas" element={<div>Visão do motorista</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const usuarioComPerfil = (perfil: 'GESTOR' | 'OPERADOR' | 'MOTORISTA') => ({
  id: 'u1',
  nome: 'Teste',
  email: 'teste@controlog.com',
  perfil,
});

beforeEach(() => {
  useAuthStore.setState({ usuario: null, accessToken: null, refreshToken: null });
});

describe('RequireAuth', () => {
  test('redireciona para /login quando não há accessToken', () => {
    renderApp('/');

    expect(screen.getByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument();
  });

  test('renderiza a rota protegida quando há accessToken', () => {
    useAuthStore.setState({ accessToken: 'token-valido' });

    renderApp('/');

    expect(screen.getByText('Área protegida')).toBeInTheDocument();
  });

  test('motorista que tenta abrir a área de gestão vai para a visão dele', () => {
    useAuthStore.setState({
      accessToken: 'token-valido',
      usuario: usuarioComPerfil('MOTORISTA'),
    });

    renderAppComPerfis('/');

    expect(screen.getByText('Visão do motorista')).toBeInTheDocument();
    expect(screen.queryByText('Área de gestão')).not.toBeInTheDocument();
  });

  test('gestor que tenta abrir a visão do motorista volta para a área de gestão', () => {
    useAuthStore.setState({
      accessToken: 'token-valido',
      usuario: usuarioComPerfil('GESTOR'),
    });

    renderAppComPerfis('/minhas-rotas');

    expect(screen.getByText('Área de gestão')).toBeInTheDocument();
    expect(screen.queryByText('Visão do motorista')).not.toBeInTheDocument();
  });

  test('perfil autorizado abre a rota normalmente', () => {
    useAuthStore.setState({
      accessToken: 'token-valido',
      usuario: usuarioComPerfil('OPERADOR'),
    });

    renderAppComPerfis('/');

    expect(screen.getByText('Área de gestão')).toBeInTheDocument();
  });
});
