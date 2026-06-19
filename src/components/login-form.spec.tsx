import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './login-form';
import { MemoryRouter } from 'react-router-dom';
import { authService } from '@/services/auth.service';

const mockSignIn = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('deve renderizar os campos de email e senha', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro em caso de falha de login', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({ response: { status: 401 } });
    renderWithRouter(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/usuário ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it('deve chamar login com credenciais corretas', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({ token: 'fake-token' } as any);
    renderWithRouter(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: 'teste@teste.com', password: '123456' });
      expect(mockSignIn).toHaveBeenCalledWith('fake-token');
    });
  });
});
