import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HistoryPage from "./History";
import * as logsService from "@/services/logs.service";

// Mock do serviço de logs
vi.mock("@/services/logs.service", () => ({
    getIntegrationLogs: vi.fn(),
    getStatusChangeLogs: vi.fn(),
    getOperatorReadingLogs: vi.fn(),
}));

vi.mock("@/services/user.service", () => ({
    getOperators: vi.fn(() => Promise.resolve([{ id: "op-uuid-1", name: "Gabriel Operador" }])),
}));

describe("HistoryPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockIntegrationLogs = {
        data: [
            {
                id: "log-int-1",
                endpoint: "/api/integration/test",
                payload: { test: "data" },
                http_status: 202,
                error_message: null,
                received_at: "2026-06-20T23:00:00.000000Z"
            }
        ],
        path: "http://localhost/api/logs/integration",
        per_page: 10,
        next_cursor: "cursor-next-int",
        next_page_url: "http://localhost/api/logs/integration?cursor=cursor-next-int",
        prev_cursor: null,
        prev_page_url: null
    };

    const mockStatusChangeLogs = {
        data: [
            {
                id: "log-status-1",
                loading_order_id: "order-uuid-1",
                old_status: "pending",
                new_status: "in_progress",
                changed_by: "Operador Teste",
                changed_at: "2026-06-20T23:05:00.000000Z",
                note: "Iniciou carregamento"
            }
        ],
        path: "http://localhost/api/logs/status-changes",
        per_page: 10,
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null
    };

    const mockOperatorReadingLogs = {
        data: [
            {
                id: "log-reading-1",
                loading_order_id: "order-uuid-1",
                operator_id: "op-uuid-1",
                package_id: "pkg-uuid-1",
                scanned_code: "PKG-SCAN-111",
                status: "success" as const,
                error_message: null,
                customer_name: "Cliente Teste",
                operator_name: "Gabriel Operador",
                scanned_at: "2026-06-20T23:10:00.000000Z",
                created_at: "2026-06-20T23:10:00.000000Z"
            }
        ],
        path: "http://localhost/api/logs/operator-readings",
        per_page: 10,
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null
    };

    it("deve renderizar a tela com as abas e o modo de integração por padrão", async () => {
        vi.mocked(logsService.getIntegrationLogs).mockResolvedValueOnce(mockIntegrationLogs);

        render(<HistoryPage />);

        expect(screen.getByText("Histórico de Operações")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Logs de Integração" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Histórico de Status" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Leitura do Operador" })).toBeInTheDocument();

        await waitFor(() => {
            expect(logsService.getIntegrationLogs).toHaveBeenCalled();
        });

        expect(screen.getByText("/api/integration/test")).toBeInTheDocument();
        expect(screen.getByText("202")).toBeInTheDocument();
    });

    it("deve alternar para a aba de alteração de status ao ser clicada", async () => {
        vi.mocked(logsService.getIntegrationLogs).mockResolvedValue(mockIntegrationLogs);
        vi.mocked(logsService.getStatusChangeLogs).mockResolvedValueOnce(mockStatusChangeLogs);

        render(<HistoryPage />);

        const statusTabButton = screen.getByRole("button", { name: "Histórico de Status" });
        fireEvent.click(statusTabButton);

        await waitFor(() => {
            expect(logsService.getStatusChangeLogs).toHaveBeenCalled();
        });

        expect(screen.getByText("Operador Teste")).toBeInTheDocument();
    });

    it("deve alternar para a aba de leituras do operador ao ser clicada", async () => {
        vi.mocked(logsService.getIntegrationLogs).mockResolvedValue(mockIntegrationLogs);
        vi.mocked(logsService.getOperatorReadingLogs).mockResolvedValueOnce(mockOperatorReadingLogs);

        render(<HistoryPage />);

        const operatorTabButton = screen.getByRole("button", { name: "Leitura do Operador" });
        fireEvent.click(operatorTabButton);

        await waitFor(() => {
            expect(logsService.getOperatorReadingLogs).toHaveBeenCalled();
        });

        expect(screen.getByText("PKG-SCAN-111")).toBeInTheDocument();
        expect(screen.getByText("Gabriel Operador")).toBeInTheDocument();
        expect(screen.getByText("Cliente Teste")).toBeInTheDocument();
    });

    it("deve abrir o modal de payload ao clicar no botão de visualizar na aba de integração", async () => {
        vi.mocked(logsService.getIntegrationLogs).mockResolvedValue(mockIntegrationLogs);

        render(<HistoryPage />);

        await waitFor(() => {
            expect(screen.getByText("/api/integration/test")).toBeInTheDocument();
        });

        const viewButton = screen.getByTitle("Ver Payload");
        fireEvent.click(viewButton);

        expect(screen.getByText(/Payload da Integração - ID log-int-/)).toBeInTheDocument();
        expect(screen.getByText(/"test": "data"/)).toBeInTheDocument();
    });
});
