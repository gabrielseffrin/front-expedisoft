import { useEffect, useState } from "react";
import React from "react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Package, Activity, AlertCircle, CheckCircle2, RefreshCw, TrendingUp, Clock, Printer, Download } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { getOrders } from "@/services/orders.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
};

const columns = [
    {
        id: "id",
        header: "#",
        cell: ({ row }: any) => (
            <span className="text-muted-foreground font-mono text-xs">{row.index + 1}</span>
        ),
    },
    {
        accessorKey: "external_id",
        header: "Ordem",
        cell: ({ row }: any) => (
            <span className="font-medium text-sm">{row.getValue("external_id")}</span>
        ),
    },
    {
        accessorKey: "customer",
        header: "Cliente",
        cell: ({ row }: any) => (
            <span className="text-sm">{row.getValue("customer")}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
            <StatusBadge status={row.getValue("status")} />
        ),
    },
    {
        accessorKey: "operator",
        header: "Operador",
        cell: ({ row }: any) => (
            <span className="text-sm text-muted-foreground">{row.getValue("operator") || "-"}</span>
        ),
    },
    {
        accessorKey: "updated_at",
        header: "Atualizado",
        cell: ({ row }: any) => (
            <span className="text-xs text-muted-foreground">{formatDate(row.getValue("updated_at"))}</span>
        ),
    },
];

interface KpiCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    isLoading: boolean;
}

function KpiCard({ title, value, subtitle, icon: Icon, colorClass, bgClass, borderClass, isLoading }: KpiCardProps) {
    return (
        <Card className={cn("border-t-4 transition-all hover:shadow-md hover:-translate-y-0.5", borderClass)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", bgClass)}>
                    <Icon className={cn("h-5 w-5", colorClass)} />
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {isLoading ? (
                    <>
                        <Skeleton className="h-9 w-16 mb-2" />
                        <Skeleton className="h-3 w-28" />
                    </>
                ) : (
                    <>
                        <div className="flex items-end gap-2">
                            <div className={cn("text-4xl font-bold", colorClass)}>{value}</div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground mb-1 opacity-40" />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [scheduledToday, setScheduledToday] = useState(0);
    const [ordersInProgress, setOrdersInProgress] = useState(0);
    const [divergences, setDivergences] = useState(0);
    const [completedToday, setCompletedToday] = useState(0);

    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders(page);
            const rawData = response.data || [];

            const sortedData = [...rawData].sort((a: any, b: any) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );

            setOrders(sortedData);
            setTotalPages(response.meta?.last_page || 1);

            const counts = rawData.reduce((acc: any, order: any) => {
                if (order.status) acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {});

            setScheduledToday(counts["scheduled"] || 0);
            setOrdersInProgress(counts["in_progress"] || 0);
            setCompletedToday(counts["completed"] || 0);
            setDivergences(counts["divergence"] || 0);
        } catch {
            toast.error("Não foi possível carregar as ordens.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [page]);



    const kpiCards = [
        {
            title: "Agendamentos",
            value: scheduledToday,
            subtitle: "Ordens agendadas",
            icon: Clock,
            colorClass: "text-blue-600",
            bgClass: "bg-blue-50",
            borderClass: "border-t-blue-500",
        },
        {
            title: "Em Andamento",
            value: ordersInProgress,
            subtitle: "Em carregamento",
            icon: Activity,
            colorClass: "text-indigo-600",
            bgClass: "bg-indigo-50",
            borderClass: "border-t-indigo-500",
        },
        {
            title: "Divergências",
            value: divergences,
            subtitle: "Requerem atenção",
            icon: AlertCircle,
            colorClass: "text-red-600",
            bgClass: "bg-red-50",
            borderClass: "border-t-red-500",
        },
        {
            title: "Concluídos",
            value: completedToday,
            subtitle: "Finalizados com sucesso",
            icon: CheckCircle2,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-50",
            borderClass: "border-t-emerald-500",
        },
    ];

    return (
        <div className="space-y-6">

            {/* KPI Cards */}
            <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card) => (
                    <KpiCard key={card.title} {...card} isLoading={loading} />
                ))}
            </div>

            {/* Tabela de Atividade Recente */}
            <div className="border-t border-border bg-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">Atividade Recente</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Últimas ordens atualizadas no sistema
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                                        <Printer className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Imprimir</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Funcionalidade em desenvolvimento</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                                        <Download className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Exportar CSV</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Funcionalidade em desenvolvimento</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs ml-2"
                            onClick={fetchOrders}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                            Atualizar
                        </Button>
                    </div>
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
    );
}