import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    Truck,
    User,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    LayoutDashboard,
    Navigation,
    Activity,
    Images,
    Printer,
    Download,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import CustomAlert from "@/components/ui/custom-alert";

import { getOrder } from "@/services/orders.service";

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-red-100 text-red-800' },
    completed: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
    divergence: { label: 'Divergencia', className: 'bg-red-800 text-red-100' },
    scheduled: { label: 'Agendada', className: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'Carregando', className: 'bg-blue-100 text-blue-800' },
};

export default function OrderDetails() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
        } catch (e) {
            return "-";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!orderId) return;

            setLoading(true);
            try {
                const response = await getOrder(orderId);

                setOrder(response.data);
                setPackages(response.data.items?.flatMap((item: any) => item.packages || []) || []);
            } catch (error) {
                setError("Erro ao carregar os dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="flex w-full flex-col items-center justify-center p-20 space-y-4">
                <Activity className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando detalhes do pedido...</p>
            </div>
        );
    }

    if (!order && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <AlertCircle size={48} className="text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Pedido não encontrado</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    Voltar para lista
                </Button>
            </div>
        );
    }

    const config = statusConfig[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-800' };

    return (
        <div className="w-full space-y-6">
            {error && (
                <CustomAlert
                    variant="destructive"
                    message="Erro ao processar solicitação."
                    error={error}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pedido Externo: {order.external_id}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${config.className}`}>
                        {config.label}
                    </span>
                </div>
            </div>

            {order.status === "divergence" && (
                <Card className="border-red-200 bg-red-50/40">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Atenção: Divergência
                                Detectada</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-900 leading-relaxed italic">
                            &quot;{order.justification || "Nenhuma justificativa fornecida pelo operador."}&quot;
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b pb-4 mb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Informações da Carga e Logística
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <InfoItem icon={User} label="Cliente / Destinatário"
                                      value={order.customer || order.customerName} />
                            <InfoItem icon={Navigation} label="Destino" value={order.destination} />
                            <InfoItem icon={Truck} label="Transportadora" value={order.carrier} />
                            <InfoItem icon={User} label="Motorista Responsável" value={order.driver} />
                            <InfoItem icon={Package} label="Veículo e Placa" value={order.vehicle} />
                            <InfoItem icon={LayoutDashboard} label="Doca de Operação" value={order.dock} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b pb-4 mb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                Itens da Ordem
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-col w-full p-4 border-2 border-dashed rounded-lg min-h-[250px] bg-muted/5">
                                {packages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground min-h-[200px]">
                                        <Package className="h-12 w-12 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Nenhum item registrado para esta ordem.</p>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col gap-3">
                                        {packages.map((pkg, index) => (
                                            <div
                                                key={pkg.id || index}
                                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-md border bg-card hover:bg-muted/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 w-40">
                                                    <Package
                                                        className={`h-5 w-5 ${pkg.status === 'checked' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        pkg.status === 'checked'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-secondary text-secondary-foreground'
                                                    }`}>
                                                        {pkg.status === 'checked' ? 'Conferido' : 'Pendente'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 flex-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">ID do Pacote</span>
                                                        <span className="text-sm font-medium truncate" title={pkg.unique_package_code}>{pkg.unique_package_code || "-"}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Quantidade</span>
                                                        <span className="text-sm font-medium">{pkg.quantity_in_package || "-"}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">Data</span>
                                                        <span className="text-sm">
                                                            {pkg.checked_at ? new Date(pkg.checked_at).toLocaleDateString('pt-BR') : "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b pb-4 mb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Images className="h-4 w-4 text-muted-foreground" />
                                Fotos do Carregamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                                <Package className="h-10 w-10 mb-2 opacity-10" />
                                <p className="text-sm">Não há fotos do carregamento disponíveis.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader className="border-b pb-4 mb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Resumo da Execução
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoItem icon={User} label="Operador" value={order.operator} />

                            <div className="pt-4 border-t space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempos</p>
                                <InfoItem icon={CalendarIcon} label="Início" value={formatDate(order.started_at)} />
                                <InfoItem icon={CheckCircle2} label="Conclusão" value={formatDate(order.completed_at)} />
                            </div>

                            <div className="pt-6 grid grid-cols-1 gap-2">
                                <Button className="w-full gap-2">
                                    <Printer className="h-4 w-4" />
                                    Imprimir Ordem
                                </Button>
                                <Button variant="outline" className="w-full gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) {
    return (
        <div className="flex items-start gap-3">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className="text-sm font-semibold text-foreground truncate">{value || "-"}</span>
            </div>
        </div>
    );
}