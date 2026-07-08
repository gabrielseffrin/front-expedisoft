import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppRoutes } from './App';
import { MemoryRouter } from 'react-router-dom';
import * as useAuthHook from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('AppRoutes', () => {
  it('deve redirecionar para login se usuário não estiver autenticado ao acessar rota protegida', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      signed: false,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Faça login para acessar o painel de controle')).toBeInTheDocument();

    expect(screen.queryByText('Tendência de Atividade')).not.toBeInTheDocument();
  });

  it('deve permitir o acesso à rota protegida se o usuário estiver autenticado', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      signed: true,
      loading: false,
      user: { id: '1', name: 'Admin', email: 'admin@admin.com', profile: 'admin' } as any,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Tendência de Atividade')).toBeInTheDocument();
  });

  it('deve mostrar tela de loading se a autenticação estiver carregando', () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      signed: false,
      loading: true,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
