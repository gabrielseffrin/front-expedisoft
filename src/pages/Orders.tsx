import {useEffect, useState} from "react";
import {getOrder, getOrders} from "@/services/orders.service";
import {DataTable} from "@/components/ui/data-table";
import {MoreHorizontal} from "lucide-react"
import CustomAlert from "@/components/ui/custom-alert";

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState([]);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);

    const columns = [
        //{ accessorKey: 'id', header: 'ID' },
        {accessorKey: 'external_id', header: 'External ID'},
        {accessorKey: 'customer', header: 'Cliente'},
        {accessorKey: 'issue_date', header: 'Data'},
        {accessorKey: 'scheduled_at', header: 'Data Agendada'},
        {accessorKey: 'started_at', header: 'Data Início'},
        {accessorKey: 'completed_at', header: 'Data Conclusão'},
        {accessorKey: 'operator', header: 'Operador'},
        {
            accessorKey: 'status', header: 'Status',
            cell: ({row}) => {
                const status = row.getValue('status');

                const statusConfig: Record<string, { label: string; className: string }> = {
                    pending: {label: 'Pendente', className: 'bg-red-100 text-red-800'},
                    completed: {label: 'Concluído', className: 'bg-green-100 text-green-800'},
                    cancelled: {label: 'Cancelado', className: 'bg-red-100 text-red-800'},
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
            cell: ({row: _row}) => {
                const externalId = _row.getValue('external_id');
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    handleOpenModal();
                                    fetchOrder(externalId as string);
                                }}>
                                Agendar Carregamento
                            </DropdownMenuItem>
                            {/*<DropdownMenuSeparator/>
                            <DropdownMenuItem>{externalId}</DropdownMenuItem>
                            <DropdownMenuItem>View payment details</DropdownMenuItem>*/}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },

    ];

    const fetchOrders = async () => {
        try {
            const respose = await getOrders();
            setOrders(respose.data);
        } catch (error) {
            setError("Não foi possível carregar as ordens. Tente novamente.");
        }
    };

    const fetchOrder = async (id: string) => {
        try {
            const response = await getOrder(id);
            setOrder(response.data);
        } catch (error) {
            setError("Não foi possível carregar os detalhes da ordem. Tente novamente.");
        }
    }

    const handleOpenModal = () => {
        setModalOpen(true);
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        fetchOrders();
    }, []);


    return (
        <div className="flex h-screen justify-center">
            {error && (
                <CustomAlert variant="destructive" message={"Erro ao carregar dados."} error={error}/>
            )}
            <DataTable columns={columns} data={orders}/>


            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <form>
                        <DialogHeader>
                            <DialogTitle>Agendar Carregamento</DialogTitle>
                            <DialogDescription>
                                Preencha as informações para agendar o carregamento.
                            </DialogDescription>
                            <DialogDescription>
                                <span className="font-bold">Ordem:</span> {order.external_id} <br/>
                                <span className="font-bold">Cliente:</span> {order.customer} <br/>
                                <span className="font-bold">Transportadora:</span> {order.carrier} | {order.driver} | {order.vehicle}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="scheduled_at">Data Agendada</Label>
                                <Input id="scheduled_at" name="scheduled_at" type="date"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="operator">Operador</Label>
                                <Input id="operator" name="operator" placeholder="Nome do operador"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="doca">Doca de Carregamento</Label>
                                <Input id="doca" name="doca" placeholder="Doca de carregamento"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


        </div>


    );
}