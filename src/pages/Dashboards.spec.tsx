import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './Dashboards';
import * as ordersService from '@/services/orders.service';

vi.mock('@/services/orders.service', () => ({
  getOrders: vi.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar as métricas corretamente com base nas ordens', async () => {
    const mockOrders = [
      { id: '1', status: 'scheduled', updated_at: '2023-10-01T10:00:00Z' },
      { id: '2', status: 'in_progress', updated_at: '2023-10-01T11:00:00Z' },
      { id: '3', status: 'divergence', updated_at: '2023-10-01T12:00:00Z' },
      { id: '4', status: 'completed', updated_at: '2023-10-01T13:00:00Z' },
      { id: '5', status: 'completed', updated_at: '2023-10-01T14:00:00Z' },
    ];

    vi.mocked(ordersService.getOrders).mockResolvedValueOnce({
      data: mockOrders as any,
      meta: { last_page: 1 } as any
    } as any);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(ordersService.getOrders).toHaveBeenCalled();
    });

    expect(screen.getByText('Carregamentos Hoje')).toBeInTheDocument();

    const scheduledText = screen.getByText(/Agendadas para hoje/i);
    expect(scheduledText.parentElement).toHaveTextContent('1');

    const inProgressText = screen.getByText(/Em carregamento/i);
    expect(inProgressText.parentElement).toHaveTextContent('1');

    const divergenceText = screen.getByText(/Requerem atenção/i);
    expect(divergenceText.parentElement).toHaveTextContent('1');

    const completedText = screen.getByText(/Finalizados hoje/i);
    expect(completedText.parentElement).toHaveTextContent('2');
  });

  it('deve exibir mensagem de erro se a API falhar', async () => {
    vi.mocked(ordersService.getOrders).mockRejectedValueOnce(new Error('API Error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Não foi possível carregar as ordens./i)).toBeInTheDocument();
    });
  });
});
