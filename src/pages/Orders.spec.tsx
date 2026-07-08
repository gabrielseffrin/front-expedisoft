import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrdersPage from './Orders';
import { MemoryRouter } from 'react-router-dom';
import * as ordersService from '@/services/orders.service';
import * as userService from '@/services/user.service';

vi.mock('@/services/orders.service', () => ({
  getOrders: vi.fn(),
  getDocks: vi.fn(),
  getOrder: vi.fn(),
  scheduleOrder: vi.fn(),
}));

vi.mock('@/services/user.service', () => ({
  getOperators: vi.fn(),
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getOperators).mockResolvedValue([{ id: 'op1', name: 'Operador 1' } as any]);
    vi.mocked(ordersService.getDocks).mockResolvedValue([{ id: 'd1', dock_code: 'Doca 1' }]);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('deve renderizar a tabela de ordens e carregar dados iniciais', async () => {
    const mockOrders = [
      { id: '1', external_id: 'EXT-001', customer: 'Cliente A', status: 'pending' },
    ];

    vi.mocked(ordersService.getOrders).mockResolvedValueOnce({ data: mockOrders as any, meta: { last_page: 1 } as any } as any);
    vi.mocked(userService.getOperators).mockResolvedValueOnce([{ id: 'op1', name: 'Operador 1' } as any]);
    vi.mocked(ordersService.getDocks).mockResolvedValueOnce([{ id: 'd1', dock_code: 'Doca 1' }]);

    renderWithRouter(<OrdersPage />);

    await waitFor(() => {
      expect(ordersService.getOrders).toHaveBeenCalledWith(1);
      expect(userService.getOperators).toHaveBeenCalled();
      expect(ordersService.getDocks).toHaveBeenCalled();
    });

    expect(screen.getByText('EXT-001')).toBeInTheDocument();
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
  });

  it('deve abrir o modal de agendamento ao clicar na ação', async () => {
    const user = userEvent.setup();
    const mockOrders = [
      { id: '1', external_id: 'EXT-001', customer: 'Cliente A', status: 'pending' },
    ];

    vi.mocked(ordersService.getOrders).mockResolvedValueOnce({ data: mockOrders as any, meta: { last_page: 1 } as any } as any);
    vi.mocked(ordersService.getOrder).mockResolvedValueOnce({ data: mockOrders[0] as any });

    renderWithRouter(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('EXT-001')).toBeInTheDocument();
    });

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    await user.click(menuButton);

    const scheduleButton = await screen.findByText(/agendar carregamento/i);
    await user.click(scheduleButton);

    await waitFor(() => {
      expect(ordersService.getOrder).toHaveBeenCalledWith('1');
    });

    expect(screen.getByText('Agendar Carregamento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar agendamento/i })).toBeInTheDocument();
  });

  it.skip('deve preencher e submeter o formulário de agendamento com sucesso', async () => {
    const user = userEvent.setup();
    const mockOrders = [
      { id: '1', external_id: 'EXT-001', customer: 'Cliente A', status: 'pending' },
    ];

    vi.mocked(ordersService.getOrders).mockResolvedValue({ data: mockOrders as any, meta: { last_page: 1 } as any } as any);
    vi.mocked(ordersService.getOrder).mockResolvedValueOnce({ data: mockOrders[0] as any });
    vi.mocked(userService.getOperators).mockResolvedValueOnce([{ id: 'op1', name: 'Operador 1' } as any]);
    vi.mocked(ordersService.getDocks).mockResolvedValueOnce([{ id: 'd1', dock_code: 'Doca 1' }]);
    vi.mocked(ordersService.scheduleOrder).mockResolvedValueOnce({} as any);

    renderWithRouter(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('EXT-001')).toBeInTheDocument();
    });

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    await user.click(menuButton);
    const scheduleButton = await screen.findByText(/agendar carregamento/i);
    await user.click(scheduleButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmar agendamento/i })).toBeInTheDocument();
    });

    const operatorSelect = screen.getByLabelText(/operador/i);
    await user.selectOptions(operatorSelect, 'op1');

    const dockSelect = screen.getByLabelText(/doca de carregamento/i);
    await user.selectOptions(dockSelect, 'd1');

    const datePopover = screen.getByRole('button', { name: /selecione a data/i });
    await user.click(datePopover);

    const dayButtons = await screen.findAllByRole('gridcell');
    const validDay = dayButtons.find(btn => !btn.hasAttribute('disabled'));
    if (validDay) {
      await user.click(validDay);
    }

    const submitBtn = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(ordersService.scheduleOrder).toHaveBeenCalled();
      expect(ordersService.getOrders).toHaveBeenCalledTimes(2);
    });
  });
});
