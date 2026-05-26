"use client";

import React, { useEffect, useState } from "react";
import { getDocks, getOrder, getOrders, scheduleOrder } from "@/services/orders.service";
import { DataTable } from "@/components/ui/data-table";
import { CalendarIcon, Clock, Eye, Calendar, User, Warehouse, MoreHorizontal, Printer, Download, Filter } from "lucide-react";
import CustomAlert from "@/components/ui/custom-alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getOperators } from "@/services/user.service";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [operators, setOperators] = useState<any[]>([]);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
    const [scheduledTime, setScheduledTime] = useState<string>("12:00");
    const [operator, setOperator] = useState<string>('');
    const [dock, setDock] = useState<string>('');
    const [docks, setDocks] = useState<any[]>([]);

    const navigate = useNavigate();

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    };

    const columns = [
        {
            accessorKey: 'external_id',
            header: 'Ordem',
            cell: ({ row }: any) => (
                <span className="font-medium text-sm">{row.getValue('external_id')}</span>
            ),
        },
        {
            accessorKey: 'customer',
            header: 'Cliente',
            cell: ({ row }: any) => (
                <span className="text-sm">{row.getValue('customer')}</span>
            ),
        },
        {
            accessorKey: 'issue_date',
            header: 'Emissão',
            cell: ({ row }: any) => (
                <span className="text-xs text-muted-foreground">{formatDate(row.getValue('issue_date'))}</span>
            ),
        },
        {
            accessorKey: 'scheduled_at',
            header: 'Agendado',
            cell: ({ row }: any) => (
                <span className="text-xs text-muted-foreground">{formatDate(row.getValue('scheduled_at'))}</span>
            ),
        },
        {
            accessorKey: 'started_at',
            header: 'Início',
            cell: ({ row }: any) => (
                <span className="text-xs text-muted-foreground">{formatDate(row.getValue('started_at'))}</span>
            ),
        },
        {
            accessorKey: 'completed_at',
            header: 'Conclusão',
            cell: ({ row }: any) => (
                <span className="text-xs text-muted-foreground">{formatDate(row.getValue('completed_at'))}</span>
            ),
        },
        {
            accessorKey: 'operator',
            header: 'Operador',
            cell: ({ row }: any) => (
                <span className="text-sm text-muted-foreground">{row.getValue('operator') || '-'}</span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: any) => (
                <StatusBadge status={row.getValue('status')} />
            ),
        },
        {
            id: "actions",
            header: "Ações",
            enableSorting: false,
            cell: ({ row }: any) => {
                const orderId = row.original.id;
                const status = row.getValue('status') as string;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(status === 'pending' || status === 'scheduled') && (
                                <DropdownMenuItem
                                    onClick={() => handleOpenModal(orderId as string)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Agendar Carregamento
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => handleOrderDetails(orderId as string)}
                                className="gap-2 cursor-pointer"
                            >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                Ver Detalhes
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders(page);
            setOrders(response.data);
            setTotalPages(response.meta.last_page);
        } catch {
            toast.error("Não foi possível carregar as ordens.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            const response = await getOperators();
            setOperators(response);
        } catch {
            toast.error("Não foi possível carregar os operadores.");
        }
    };

    const fetchDocks = async () => {
        try {
            const response = await getDocks();
            setDocks(response);
        } catch {
            toast.error("Não foi possível carregar as docas.");
        }
    };

    const handleOpenModal = async (id: string) => {
        try {
            const response = await getOrder(id);
            setOrder(response.data);
            setSelectedOrderId(id);
            setModalOpen(true);
        } catch {
            toast.error("Erro ao carregar detalhes da ordem.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!scheduledAt || !selectedOrderId) return;

            if (!dock) {
                toast.error("Selecione uma doca de carregamento.");
                return;
            }
            if (!operator) {
                toast.error("Selecione um operador.");
                return;
            }

            const [hours, minutes] = scheduledTime.split(':');
            const finalDateTime = new Date(scheduledAt);
            finalDateTime.setHours(parseInt(hours), parseInt(minutes));

            const payload = {
                id: selectedOrderId,
                scheduled_at: finalDateTime.toISOString(),
                status: 'scheduled',
                dock_id: dock,
                operator_id: operator,
            };

            await scheduleOrder(payload);
            await fetchOrders();
            setModalOpen(false);
        } catch {
            toast.error("Erro ao agendar o carregamento.");
        } finally {
            setScheduledAt(undefined);
            setScheduledTime("12:00");
            setOperator('');
            setDock('');
        }
    };

    const handleOrderDetails = (id: string) => {
        navigate(`/order-datails/${id}`);
    };

    useEffect(() => {
        fetchOperators();
        fetchDocks();
    }, []);

    useEffect(() => { fetchOrders(); }, [page]);

    const filteredOrders = React.useMemo(() => {
        if (statusFilter === "all") return orders;
        return orders.filter((order: any) => order.status === statusFilter);
    }, [orders, statusFilter]);

    return (
        <div className="space-y-4">
            <div className="bg-white border-y border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                            <Warehouse className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">Ordens de Carregamento</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Gerencie e acompanhe o status das ordens
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-2">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="scheduled">Agendada</SelectItem>
                                    <SelectItem value="in_progress">Carregando</SelectItem>
                                    <SelectItem value="completed">Concluída</SelectItem>
                                    <SelectItem value="divergence">Divergência</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    isLoading={loading}
                />
            </div>

            {/* Modal de Agendamento */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                Agendar Carregamento
                            </DialogTitle>

                            {order && (
                                <div className="mt-3 rounded-lg bg-slate-50 border border-border p-3 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ordem</span>
                                        <span className="text-sm font-bold text-foreground">{order.external_id}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</span>
                                        <span className="text-sm text-foreground">{order.customer}</span>
                                    </div>
                                    {(order.carrier || order.driver) && (
                                        <p className="text-xs text-muted-foreground pt-0.5 italic">
                                            {[order.carrier, order.driver, order.vehicle].filter(Boolean).join(" · ")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Data e Hora */}
                            <div className="flex flex-col gap-2">
                                <Label className="flex items-center gap-1.5 text-sm font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    Data e Hora do Carregamento
                                </Label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 justify-start text-left font-normal h-9",
                                                    !scheduledAt && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {scheduledAt
                                                    ? format(scheduledAt, "dd/MM/yyyy")
                                                    : <span>Selecione a data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarPicker
                                                mode="single"
                                                selected={scheduledAt}
                                                onSelect={setScheduledAt}
                                                locale={ptBR}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <div className="relative">
                                        <Input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-[110px] pl-8 h-9"
                                        />
                                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            {/* Operador */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="operator" className="flex items-center gap-1.5 text-sm font-medium">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    Operador Responsável
                                </Label>
                                <select
                                    id="operator"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}
                                >
                                    <option value="">Selecione um operador</option>
                                    {operators?.map((op: any) => (
                                        <option key={op.id} value={op.id}>{op.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Doca */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="doca" className="flex items-center gap-1.5 text-sm font-medium">
                                    <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                                    Doca de Carregamento
                                </Label>
                                <select
                                    id="doca"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={dock}
                                    onChange={(e) => setDock(e.target.value)}
                                >
                                    <option value="">Selecione uma doca</option>
                                    {docks?.map((doca: any) => (
                                        <option key={doca.id} value={doca.id}>{doca.dock_code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                Confirmar Agendamento
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}