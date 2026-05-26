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
import type { Order } from "@/services/orders.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

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
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [scheduledToday, setScheduledToday] = useState<number>(0);
    const [ordersInProgress, setOrdersInProgress] = useState<number>(0);
    const [divergences, setDivergences] = useState<number>(0);
    const [completedToday, setCompletedToday] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);

    // Trend: ordens agrupadas por dia (últimos 14 dias baseado em updated_at)
    const [trendData, setTrendData] = useState<{ dia: string; Concluídas: number; Divergências: number }[]>([]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders(page);
            const rawData: Order[] = response.data || [];

            const sortedData = [...rawData].sort((a, b) =>
                new Date(b.updated_at ?? b.updatedAt ?? 0).getTime() -
                new Date(a.updated_at ?? a.updatedAt ?? 0).getTime()
            );

            setOrders(sortedData);
            setTotalPages(response.meta?.last_page || 1);

            const counts = rawData.reduce<Record<string, number>>((acc, order) => {
                if (order.status) acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {});

            setScheduledToday(counts["scheduled"] || 0);
            setOrdersInProgress(counts["in_progress"] || 0);
            setCompletedToday(counts["completed"] || 0);
            setDivergences(counts["divergence"] || 0);

            // Gera os últimos 14 dias
            const today = new Date();
            const days = Array.from({ length: 14 }, (_, i) => {
                const d = new Date(today);
                d.setDate(today.getDate() - (13 - i));
                return {
                    date: d.toISOString().slice(0, 10),
                    dia: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    "Concluídas": 0,
                    "Divergências": 0,
                };
            });

            // Agrupa ordens por dia usando updated_at
            rawData.forEach(order => {
                const dateStr = (order.updated_at ?? order.updatedAt ?? '').slice(0, 10);
                const slot = days.find(d => d.date === dateStr);
                if (!slot) return;
                if (order.status === 'completed') slot["Concluídas"]++;
                if (order.status === 'divergence') slot["Divergências"]++;
            });

            setTrendData(days.map(({ dia, "Concluídas": c, "Divergências": d }) => ({ dia, "Concluídas": c, "Divergências": d })));
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

            {/* Gráfico de Tendência de Atividade */}
            <div className="px-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                                <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-foreground">Tendência de Atividade</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Ordens concluídas e divergências nos últimos 14 dias</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        {loading ? (
                            <Skeleton className="h-52 w-full rounded-lg" />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradDivergence" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="dia"
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                        interval={1}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={24}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            color: "hsl(var(--foreground))",
                                        }}
                                        cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Concluídas"
                                        stroke="#059669"
                                        strokeWidth={2}
                                        fill="url(#gradCompleted)"
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Divergências"
                                        stroke="#dc2626"
                                        strokeWidth={2}
                                        fill="url(#gradDivergence)"
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
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