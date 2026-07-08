import { api } from "./api";

// ── Interfaces dos Logs ──

export interface IntegrationLog {
    id: string;
    endpoint: string;
    payload: Record<string, any>;
    http_status: number;
    error_message: string | null;
    received_at: string;
}

export interface StatusChangeLog {
    id: string;
    loading_order_id: string;
    old_status: string;
    new_status: string;
    changed_by: string;
    changed_at: string;
    note: string | null;
}

export interface OperatorReadingLog {
    id: string;
    loading_order_id: string;
    operator_id: string;
    package_id: string;
    scanned_code: string;
    status: "success" | "error";
    error_message: string | null;
    customer_name: string;
    operator_name: string;
    scanned_at: string;
    created_at: string;
}

// ── Interface de Resposta Paginada baseada em Cursor ──

export interface LogsResponse<T> {
    data: T[];
    path: string;
    per_page: number;
    next_cursor: string | null;
    next_page_url: string | null;
    prev_cursor: string | null;
    prev_page_url: string | null;
}

// ── Filtros Comuns e Específicos ──

export interface LogFilters {
    start_date?: string;
    end_date?: string;
    per_page?: number;
    cursor?: string;
    
    // Específico para Integração
    endpoint?: string;
    http_status?: number;

    // Específico para Mudança de Status e Leituras do Operador
    loading_order_id?: string;
    
    // Específico para Mudança de Status
    new_status?: string;

    // Específico para Leituras do Operador
    operator_id?: string;
    status?: "success" | "error";
    scanned_code?: string;
}

// ── Mocks para Fallback de Desenvolvimento ──

const mockIntegrationLogs: IntegrationLog[] = [
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379111",
        endpoint: "/api/integration/order",
        payload: {
            source_system: "SAP",
            loadingOrder: {
                external_id: "ORD-12345",
                issue_date: "2026-06-20",
                customer: "Metalúrgica Central S.A.",
                items: [
                    { sku: "SKU-990-A", quantity: 150, unit: "UN" },
                    { sku: "SKU-443-B", quantity: 30, unit: "UN" }
                ]
            }
        },
        http_status: 202,
        error_message: null,
        received_at: "2026-06-20T23:00:00.000000Z"
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379112",
        endpoint: "/api/integration/order",
        payload: {
            source_system: "TOTVS",
            loadingOrder: {
                external_id: "ORD-99887",
                issue_date: "2026-06-20"
            }
        },
        http_status: 400,
        error_message: "Erro de validação: O campo customer é obrigatório.",
        received_at: "2026-06-20T22:45:10.000000Z"
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379113",
        endpoint: "/api/integration/order",
        payload: {
            source_system: "SAP",
            loadingOrder: {
                external_id: "ORD-54321",
                issue_date: "2026-06-19",
                customer: "Distribuidora de Bebidas LTDA"
            }
        },
        http_status: 202,
        error_message: null,
        received_at: "2026-06-19T18:15:30.000000Z"
    }
];

const mockStatusChangeLogs: StatusChangeLog[] = [
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379222",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379134",
        old_status: "pending",
        new_status: "in_progress",
        changed_by: "Marcos Gestor",
        changed_at: "2026-06-20T23:05:00.000000Z",
        note: "Ordem iniciada pelo operador de pátio."
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379223",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379134",
        old_status: "in_progress",
        new_status: "divergence",
        changed_by: "Roberto Conferente",
        changed_at: "2026-06-20T21:20:00.000000Z",
        note: "Divergência detectada no peso do SKU-990-A. Esperado 150kg, lido 142kg."
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379224",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379135",
        old_status: "divergence",
        new_status: "completed",
        changed_by: "Marcos Gestor",
        changed_at: "2026-06-20T17:30:00.000000Z",
        note: "Divergência liberada manualmente após re-pesagem."
    }
];

const mockOperatorReadingLogs: OperatorReadingLog[] = [
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379333",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379134",
        operator_id: "019ee751-4f2d-73c2-a320-14c88c379135",
        package_id: "019ee751-4f2d-73c2-a320-14c88c379136",
        scanned_code: "PKG-TEST-123",
        status: "success",
        error_message: null,
        customer_name: "Empresa Teste",
        operator_name: "Gabriel Operador",
        scanned_at: "2026-06-20T23:10:00.000000Z",
        created_at: "2026-06-20T23:10:00.000000Z"
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379334",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379134",
        operator_id: "019ee751-4f2d-73c2-a320-14c88c379135",
        package_id: "019ee751-4f2d-73c2-a320-14c88c379137",
        scanned_code: "PKG-ERR-999",
        status: "error",
        error_message: "Código de pacote não pertence a esta Ordem de Carregamento.",
        customer_name: "Empresa Teste",
        operator_name: "Gabriel Operador",
        scanned_at: "2026-06-20T23:08:12.000000Z",
        created_at: "2026-06-20T23:08:12.000000Z"
    },
    {
        id: "019ee751-4f2d-73c2-a320-14c88c379335",
        loading_order_id: "019ee751-4f2d-73c2-a320-14c88c379138",
        operator_id: "019ee751-4f2d-73c2-a320-14c88c379139",
        package_id: "019ee751-4f2d-73c2-a320-14c88c379140",
        scanned_code: "PKG-OK-445",
        status: "success",
        error_message: null,
        customer_name: "Supermercados Estrela",
        operator_name: "Carlos Conferente",
        scanned_at: "2026-06-20T20:15:00.000000Z",
        created_at: "2026-06-20T20:15:00.000000Z"
    }
];

// Helper para converter filtros em query string
function buildQueryParams(filters: LogFilters): Record<string, any> {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
            params[key] = val;
        }
    });
    return params;
}

// Helper para simular paginação baseada em cursor no mock
function getMockPaginatedResponse<T>(data: T[], perPage: number = 10, cursor?: string): LogsResponse<T> {
    return {
        data: data.slice(0, perPage),
        path: "http://localhost/api/logs/mock",
        per_page: perPage,
        next_cursor: data.length > perPage ? "mock-cursor-token" : null,
        next_page_url: data.length > perPage ? "http://localhost/api/logs/mock?cursor=mock-cursor-token" : null,
        prev_cursor: cursor ? "mock-prev-cursor-token" : null,
        prev_page_url: cursor ? "http://localhost/api/logs/mock?cursor=mock-prev-cursor-token" : null
    };
}

// ── Chamadas de API ──

export async function getIntegrationLogs(filters: LogFilters): Promise<LogsResponse<IntegrationLog>> {
    try {
        const response = await api.get<LogsResponse<IntegrationLog>>("/logs/integration", {
            params: buildQueryParams(filters)
        });
        return response.data;
    } catch (error) {
        console.warn("API de logs indisponível, utilizando fallback mock.", error);
        let filtered = [...mockIntegrationLogs];
        if (filters.endpoint) {
            filtered = filtered.filter(l => l.endpoint.toLowerCase().includes(filters.endpoint!.toLowerCase()));
        }
        if (filters.http_status) {
            filtered = filtered.filter(l => l.http_status === Number(filters.http_status));
        }
        return getMockPaginatedResponse(filtered, filters.per_page, filters.cursor);
    }
}

export async function getStatusChangeLogs(filters: LogFilters): Promise<LogsResponse<StatusChangeLog>> {
    try {
        const response = await api.get<LogsResponse<StatusChangeLog>>("/logs/status-changes", {
            params: buildQueryParams(filters)
        });
        return response.data;
    } catch (error) {
        console.warn("API de logs indisponível, utilizando fallback mock.", error);
        let filtered = [...mockStatusChangeLogs];
        if (filters.new_status && filters.new_status !== "all") {
            filtered = filtered.filter(l => l.new_status === filters.new_status);
        }
        return getMockPaginatedResponse(filtered, filters.per_page, filters.cursor);
    }
}

export async function getOperatorReadingLogs(filters: LogFilters): Promise<LogsResponse<OperatorReadingLog>> {
    try {
        const response = await api.get<LogsResponse<OperatorReadingLog>>("/logs/operator-readings", {
            params: buildQueryParams(filters)
        });
        return response.data;
    } catch (error) {
        console.warn("API de logs indisponível, utilizando fallback mock.", error);
        let filtered = [...mockOperatorReadingLogs];
        if (filters.status && filters.status !== "all") {
            filtered = filtered.filter(l => l.status === filters.status);
        }
        if (filters.scanned_code) {
            filtered = filtered.filter(l => l.scanned_code.toLowerCase().includes(filters.scanned_code!.toLowerCase()));
        }
        return getMockPaginatedResponse(filtered, filters.per_page, filters.cursor);
    }
}
