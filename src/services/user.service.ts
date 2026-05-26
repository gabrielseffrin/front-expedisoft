import { api } from './api';

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    //rule: string;
}

export async function getOperators(): Promise<UserResponse[]> {
    const response = await api.get<UserResponse[]>('/operators');
    return response.data;
}

export async function getUser(userId: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
}


