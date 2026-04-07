"use client";

import React, {useEffect, useState} from "react";
import {getDocks, getOrder, getOrders, scheduleOrder} from "@/services/orders.service";
import {DataTable} from "@/components/ui/data-table";
import {MoreHorizontal, CalendarIcon, Clock} from "lucide-react";
import CustomAlert from "@/components/ui/custom-alert";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {getOperators} from "@/services/user.service";
import {useNavigate} from "react-router-dom";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [operators, setOperators] = useState([]);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>(undefined);
    const [scheduledTime, setScheduledTime] = useState<string>("12:00");
    const [operator, setOperator] = useState<string>('');
    const [dock, setDock] = useState<string>('');
    const [docks, setDocks] = useState<any>([]);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return format(new Date(date), "dd/MM/yyyy HH:mm", {locale: ptBR});
    };

    const columns = [
        //{accessorKey: 'id', header: 'ID', enableHiding: false},
        {accessorKey: 'external_id', header: 'External ID', size: 300},
        {accessorKey: 'customer', header: 'Cliente'},
        {
            accessorKey: 'issue_date',
            header: 'Data',
            cell: ({row}: string) => formatDate(row.getValue('issue_date'))
        },
        {
            accessorKey: 'scheduled_at',
            header: 'Data Agendada',
            cell: ({row}: string) => formatDate(row.getValue('scheduled_at'))
        },
        {
            accessorKey: 'started_at',
            header: 'Data Início',
            cell: ({row}: string) => formatDate(row.getValue('started_at'))
        },
        {
            accessorKey: 'completed_at',
            header: 'Data Conclusão',
            cell: ({row}: string) => formatDate(row.getValue('completed_at'))
        },
        {accessorKey: 'operator', header: 'Operador'},
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({row}: string) => {
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
            id: "actions",
            header: "Ações",
            cell: ({row}: string) => {
                const orderId = row.original.id;
                const status = row.getValue('status') as string;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            {(status == 'pending' || status == 'scheduled') && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        handleOpenModal(orderId as string);
                                    }}>
                                    Agendar Carregamento
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => {
                                    handleOrderDatails(orderId as string);
                                    console.log("aqui", orderId);
                                }}>
                                Detalhes da Ordem
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getOrders(page);

            setOrders(response.data);
            setTotalPages(response.meta.last_page);
        } catch (error) {
            setError("Não foi possível carregar as ordens.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        setLoading(true);
        try {
            const response = await getOperators();

            setOperators(response);
        } catch (error) {
            setError("Não foi possível carregar os operadores.");
        } finally {
            setLoading(false);
        }
    };

    const fechDocks = async () => {
        setLoading(true);
        try {
            const response = await getDocks();

            setDocks(response);
        } catch (error) {
            setError("Não foi possível carregar as docas.");
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = async (id: string) => {
        try {
            const response = await getOrder(id);

            setOrder(response.data);
            setSelectedOrderId(id);
            setModalOpen(true);
        } catch (error) {
            setError("Erro ao carregar detalhes da ordem.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!scheduledAt || !selectedOrderId) return;

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

        } catch (error) {
            setError("Erro ao agendar o carregamento.");
        } finally {
            setScheduledAt(undefined);
            setScheduledTime("12:00");
            setOperator('');
            setDock('');
        }
    };

    const handleOrderDatails = (id: string) => {
        navigate(`/order-datails/${id}`);
    }

    useEffect(() => {
        fetchOrders();
        fetchOperators();
        fechDocks();
    }, []);

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
        <div className="w-full">
            {error && (
                <CustomAlert variant="destructive" message={"Erro ao processar solicitação."} error={error}/>
            )}

            <div className="w-full space-y-4">
                <DataTable
                    columns={columns}
                    data={orders}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    isLoading={loading}
                />
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Agendar Carregamento</DialogTitle>
                            {order && (
                                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                    <p><span className="font-bold">Ordem:</span> {order.external_id}</p>
                                    <p><span className="font-bold">Cliente:</span> {order.customer}</p>
                                    <p className="text-xs italic">
                                        {order.carrier} | {order.driver} | {order.vehicle}
                                    </p>
                                </div>
                            )}
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label>Data e Hora Agendada</Label>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !scheduledAt && "text-muted-foreground"
                                                )}>
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {scheduledAt ? format(scheduledAt, "dd/MM/yyyy") :
                                                    <span>Selecione a data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
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
                                            className="w-[110px] pl-8"
                                        />
                                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="operator">Operador</Label>
                                <select
                                    id="operator"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={operator}
                                    onChange={(e) => setOperator(e.target.value)}>
                                    <option value="">Selecione um operador</option>
                                    {operators?.map((op: any) => (
                                        <option key={op.id} value={op.id}>{op.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="doca">Doca de Carregamento</Label>
                                <select className="flex h-9 w-full rounded-md border border-input bg-background">
                                    <option value="">Selecione uma doca</option>
                                    {docks?.map((doca: any) => (
                                        <option key={doca.id} value={doca.id}>{doca.dock_code}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar Agendamento</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}