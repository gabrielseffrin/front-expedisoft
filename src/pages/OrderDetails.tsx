import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import CustomAlert from "@/components/ui/custom-alert";
import {getOrder} from "@/services/orders.service";

interface Order {
    id: string;
}

export default function OrderDetails() {
    const {orderId} = useParams<{ orderId: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            setLoading(true);
            try {
                const response = await getOrder(orderId);
                setOrder(response.data);
            } catch (error) {
                setError("Erro ao buscar detalhes da ordem.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="flex w-full justify-center p-10">
                <p>Carregando detalhes do pedido...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {error && (
                <CustomAlert
                    variant="destructive"
                    message="Erro ao processar solicitação."
                    error={error}
                />
            )}

            {order && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-4 border rounded">
                        Detalhes do pedido: {order.external_id}
                    </div>
                    <div className="md:col-span-1 p-4 border rounded">
                        Resumo da execução

                        <div>
                            <span>Status: {order.status}</span>
                        </div>
                        <div>
                            <span>Cliente: {order.customerName}</span>
                        </div>
                        <div>
                            <span>Operador: {order.operator}</span>
                        </div>
                        <div>
                            <span>Doca: {order.dock}</span>
                        </div>
                        <div>
                            <span>Início: {order.startedAt}</span>
                        </div>
                        <div>
                            <span>Fim: {order.completedAt}</span>
                        </div>
                        <div>
                            <span>Destino: {order.destination}</span>
                        </div>
                        <div>
                            <span>Transportadora: {order.carrier}</span>
                        </div>
                        <div>
                            <span>Veículo: {order.vehicle}</span>
                        </div>
                        <div>
                            <span>Mototista: {order.driver}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}