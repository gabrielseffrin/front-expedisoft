import {api} from "./api";

interface Order {
    id: string;
    external_id: string;
    status: 'pending' | 'completed' | 'cancelled';
    customerName: string;
    destination: string;
    carrier: string;
    driver: string;
    vehicle: string;
    operator: string;
    dock: string;
    justification: string;
    observation: string;
    schedule: string;
    startedAt: string;
    completedAt: string;
    items: [
        {
            id: string;
            quantity: number;
            note: string;
            product: {
                id: string;
                description: string;
                sku: string;
                unit: string;
                weight: number;
            },
            packages: [
                {
                    id: string;
                    unique_package_code: string;
                    quantity_in_package: number;
                }
            ]
        }
    ]
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

interface ScheduleOrderResponse {
    success: boolean;
    message: string;
    data?: Order;
}

interface ScheduleOrderRequest {
    id: string;
    scheduled_at: string;
    status: string;
    dock_id: string | null;
    operator_id: string;
}

interface PaginatedResponse<T> {
    data: T[];
    links: any;
    meta: any;
}

export async function getOrders(page: number = 1): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/order?page=${page}`);
    return response.data;
}

export async function getOrder(orderId: string): Promise<Order> {
    const response = await api.get<Order>(`/order/${orderId}`);
    return response.data;
}

export async function scheduleOrder(schedule: ScheduleOrderRequest): Promise<ScheduleOrderResponse> {
    const response = await api.post<ScheduleOrderResponse>(`/order/schedule-order`, schedule);
    return response.data;
}









