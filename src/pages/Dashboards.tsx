import {useEffect, useState} from "react";
import {ptBR} from "date-fns/locale";
import {format} from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import CustomAlert from "@/components/ui/custom-alert";
import {Package, Activity, AlertCircle, CheckCircle2} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {getOrders} from "@/services/orders.service";

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", {locale: ptBR});
};

const columns = [
    {
        id: "id",
        header: "ID",
        cell: ({ row }: any) => {
            return <span>{row.index + 1}</span>;
        },
    },
    {
        accessorKey: "external_id",
        header: "Ordem"
    },
    {
        accessorKey: "customer",
        header: "Cliente"
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}: any) => {
            const status = row.getValue('status') as string;
            const statusConfig: Record<string, { label: string; className: string }> = {
                pending: {label: 'Pendente', className: 'bg-red-100 text-red-800'},
                completed: {label: 'Concluído', className: 'bg-green-100 text-green-800'},
                divergence: {label: 'Divergencia', className: 'bg-red-800 text-red-100'},
                scheduled: {label: 'Agendada', className: 'bg-blue-100 text-blue-800'},
                in_progress: {label: 'Carregando', className: 'bg-blue-100 text-blue-800'},
            };
            const config = statusConfig[status] ?? {label: status, className: 'bg-gray-100 text-gray-800'};
            return (
                <span className={`px-2 py-1 rounded text-sm font-medium ${config.className}`}>
                    {config.label}
                </span>
            );
        },
    },
    {
        accessorKey: "operator",
        header: "Operador"
    },
    {
        accessorKey: "updated_at",
        header: "Atualizado",
        cell: ({row}: any) => formatDate(row.getValue('updated_at'))
    }
];

export default function DashboardPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [scheduledToday, setScheduledToday] = useState(0);
    const [ordersInProgress, setOrdersInProgress] = useState(0);
    const [divergences, setDivergences] = useState(0);
    const [completedToday, setCompletedToday] = useState(0);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);

        try {
            const response = await getOrders(page);
            const rawData = response.data || [];

            const sortedData = [...rawData]
                .sort((a: any, b: any) => {
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                });

            setOrders(sortedData);
            setTotalPages(response.meta?.last_page || 1);

            const counts = rawData.reduce((acc: any, order: any) => {
                if (order.status) {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                }
                return acc;
            }, {});

            setScheduledToday(counts["scheduled"] || 0);
            setOrdersInProgress(counts["in_progress"] || 0);
            setCompletedToday(counts["completed"] || 0);
            setDivergences(counts["divergence"] || 0);

        } catch (error) {
            setError("Não foi possível carregar as ordens.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="mt-8">
            {error && (
                <CustomAlert variant="destructive" message={"Erro ao processar solicitação."} error={error}/>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Carregamentos Hoje</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{scheduledToday}</div>
                        <p className="mt-3.5 text-xs text-muted-foreground">
                            Agendadas para hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersInProgress}</div>
                        <p className="mt-3.5 text-xs text-muted-foreground">
                            Em carregamento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Divergências</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{divergences}</div>
                        <p className="mt-3.5 text-xs text-muted-foreground">
                            Requerem atenção
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedToday}</div>
                        <p className="mt-3.5 text-xs text-muted-foreground">
                            Finalizados hoje
                        </p>
                    </CardContent>
                </Card>

                <div className="w-full col-span-1 md:col-span-2 lg:col-span-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium">Atividade Recente</p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Últimas ordens finalizadas ou agendadas</p>
                    </div>
                    <DataTable
                        columns={columns}
                        data={orders}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        isLoading={loading}
                    />
                </div>
            </div>
        </div>
    );
}