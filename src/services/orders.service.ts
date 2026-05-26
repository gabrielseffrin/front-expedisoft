import {api} from "./api";

export interface OrderPackage {
    id?: string;
    unique_package_code?: string;
    quantity_in_package?: number;
    status?: string;
    checked_at?: string | null;
}

export interface OrderItem {
    id: string;
    quantity: number;
    note: string;
    product: {
        id: string;
        description: string;
        sku: string;
        unit: string;
        weight: number;
    };
    packages: OrderPackage[];
}

export interface Order {
    id: string;
    external_id: string;
    status: 'pending' | 'completed' | 'cancelled' | 'scheduled' | 'in_progress' | 'divergence';
    customerName?: string;
    customer?: string;
    destination?: string;
    carrier?: string;
    driver?: string;
    vehicle?: string;
    operator?: string;
    dock?: string;
    justification?: string;
    observation?: string;
    schedule?: string;
    startedAt?: string;
    completedAt?: string;
    started_at?: string | null;
    completed_at?: string | null;
    issue_date?: string | null;
    scheduled_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
    items?: OrderItem[];
    totalAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface ScheduleOrderResponse {
    success: boolean;
    message: string;
    data?: Order;
}

export interface OrderResponse {
    success?: boolean;
    message?: string;
    data: Order;
}

interface ScheduleOrderRequest {
    id: string;
    scheduled_at: string;
    status: string;
    dock_id: string | null;
    operator_id: string;
}

export interface Dock {
    id: string;
    name?: string;
    dock_code?: string;
}

interface PaginatedMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    [key: string]: unknown;
}

interface PaginatedResponse<T> {
    data: T[];
    links: Record<string, unknown>;
    meta: PaginatedMeta;
}

export interface OrderPhoto {
    id: string;
    loading_order_id: string;
    storage_path: string;
    drive_id: string;
    mime: string;
    status: string;
    uploaded_by: string;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface OrderPhotosResponse {
    success: boolean;
    data: {
        loading_order_id: string;
        count: number;
        photos: OrderPhoto[];
    };
}

export async function getOrders(page: number = 1): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>(`/order?page=${page}`);
    return response.data;
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/order/${orderId}`);
    return response.data;
}

export async function getDocks(): Promise<Dock[]> {
    const response = await api.get<Dock[]>(`/docks`);
    return response.data;
}

export async function scheduleOrder(schedule: ScheduleOrderRequest): Promise<ScheduleOrderResponse> {
    const response = await api.post<ScheduleOrderResponse>(`/order/schedule-order`, schedule);
    return response.data;
}

export async function getOrderPhotos(orderId: string): Promise<OrderPhotosResponse> {
    const response = await api.get<OrderPhotosResponse>(`/order/${orderId}/photos`);
    return response.data;
}
