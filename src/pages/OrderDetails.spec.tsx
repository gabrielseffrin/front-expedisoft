import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderDetails from './OrderDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as ordersService from '@/services/orders.service';

vi.mock('@/services/orders.service', () => ({
  getOrder: vi.fn(),
  getOrderPhotos: vi.fn(),
}));

describe('OrderDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement, initialEntry = '/order-datails/1') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/order-datails/:orderId" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve exibir mensagem de carregamento inicial', () => {
    vi.mocked(ordersService.getOrder).mockImplementation(() => new Promise(() => { }));
    vi.mocked(ordersService.getOrderPhotos).mockImplementation(() => new Promise(() => { }));

    renderWithRouter(<OrderDetails />);
    expect(screen.getByText(/carregando detalhes do pedido/i)).toBeInTheDocument();
  });

  it('deve renderizar os detalhes da ordem corretamente', async () => {
    const mockOrder = {
      id: '1',
      external_id: 'EXT-001',
      customer: 'Cliente A',
      status: 'pending',
      items: [
        {
          packages: [
            { id: 'pkg1', unique_package_code: 'PKG-001', status: 'checked' }
          ]
        }
      ]
    };

    vi.mocked(ordersService.getOrder).mockResolvedValueOnce({ data: mockOrder });
    vi.mocked(ordersService.getOrderPhotos).mockResolvedValueOnce({ data: { photos: [] } });

    renderWithRouter(<OrderDetails />);

    await waitFor(() => {
      expect(screen.queryByText(/carregando detalhes do pedido/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Pedido Externo: EXT-001')).toBeInTheDocument();
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
    expect(screen.getByText('PKG-001')).toBeInTheDocument();
  });

  it('deve exibir mensagem de não encontrado em caso de erro', async () => {
    vi.mocked(ordersService.getOrder).mockRejectedValueOnce(new Error('Not found'));
    vi.mocked(ordersService.getOrderPhotos).mockResolvedValueOnce({ data: { photos: [] } });

    renderWithRouter(<OrderDetails />);

    await waitFor(() => {
      expect(screen.getByText(/pedido não encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve abrir e fechar a foto ampliada ao clicar na miniatura', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const mockOrder = {
      id: '1',
      external_id: 'EXT-001',
      customer: 'Cliente A',
      status: 'pending',
    };

    const mockPhotos = {
      photos: [
        { id: 'p1', drive_id: 'drive_id_1' }
      ]
    };

    vi.mocked(ordersService.getOrder).mockResolvedValueOnce({ data: mockOrder });
    vi.mocked(ordersService.getOrderPhotos).mockResolvedValueOnce({ data: mockPhotos });

    renderWithRouter(<OrderDetails />);

    await waitFor(() => {
      expect(screen.getByAltText('Foto 1 da ordem')).toBeInTheDocument();
    });

    const photoThumb = screen.getByAltText('Foto 1 da ordem');
    await user.click(photoThumb);

    const modalImage = await screen.findByAltText('Foto ampliada do carregamento');
    expect(modalImage).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button');
    const customCloseButton = closeButtons[closeButtons.length - 1];
    await user.click(customCloseButton);

    await waitFor(() => {
      expect(screen.queryByAltText('Foto ampliada do carregamento')).not.toBeInTheDocument();
    });
  });
});
