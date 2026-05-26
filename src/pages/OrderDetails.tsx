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
    X,
    ZoomIn,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

import { getOrder, getOrderPhotos } from "@/services/orders.service";
import type { Order, OrderItem, OrderPackage, OrderPhoto } from "@/services/orders.service";
import OrderFeedbackCard from "@/components/OrderFeedbackCard";

// ─── Timeline de status ───────────────────────────────────────────────────────
const STATUS_STEPS = [
    { key: "pending", label: "Pendente", icon: Clock },
    { key: "scheduled", label: "Agendada", icon: CalendarIcon },
    { key: "in_progress", label: "Carregando", icon: Activity },
    { key: "completed", label: "Concluída", icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
    pending: 0,
    scheduled: 1,
    in_progress: 2,
    completed: 3,
    divergence: 3,
};

function StatusTimeline({ status }: { status: string }) {
    const currentIndex = STATUS_ORDER[status] ?? 0;
    const isDivergence = status === "divergence";

    return (
        <div className="flex items-center gap-1 w-full">
            {STATUS_STEPS.map((step, i) => {
                const isCompleted = i < currentIndex;
                const isCurrent = i === currentIndex && !isDivergence;
                const isDivergedStep = isDivergence && i === currentIndex;
                const StepIcon = step.icon;

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1 flex-1">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                                    isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : isCurrent
                                            ? "bg-primary border-primary text-white ring-4 ring-primary/20"
                                            : isDivergedStep
                                                ? "bg-red-500 border-red-500 text-white"
                                                : "bg-muted border-border text-muted-foreground"
                                )}
                            >
                                <StepIcon className="h-3.5 w-3.5" />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium text-center leading-tight",
                                    isCompleted ? "text-emerald-600" :
                                        isCurrent ? "text-primary" :
                                            isDivergedStep ? "text-red-600" :
                                                "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {i < STATUS_STEPS.length - 1 && (
                            <div
                                className={cn(
                                    "h-0.5 flex-1 rounded-full mb-4 transition-all",
                                    i < currentIndex ? "bg-emerald-400" : "bg-border"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Skeleton de carregamento ─────────────────────────────────────────────────
function DetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        </div>
    );
}

// ─── Componente InfoItem ──────────────────────────────────────────────────────
function InfoItem({
    label,
    value,
    icon: Icon
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/60 shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <span className="text-sm font-semibold text-foreground truncate mt-0.5">
                    {value || "-"}
                </span>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function OrderDetails() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [packages, setPackages] = useState<OrderPackage[]>([]);
    const [photos, setPhotos] = useState<OrderPhoto[]>([]);
    const [photosLoading, setPhotosLoading] = useState<boolean>(false);
    const [selectedPhoto, setSelectedPhoto] = useState<OrderPhoto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
        } catch {
            return "-";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!orderId) { setLoading(false); return; }

            setLoading(true);
            try {
                const response = await getOrder(orderId);
                setOrder(response.data);
                setPackages(
                    response.data.items?.flatMap((item: OrderItem) => item.packages || []) || []
                );
            } catch {
                toast.error("Erro ao carregar os dados.");
            } finally {
                setLoading(false);
            }

            setPhotosLoading(true);
            try {
                const photosResponse = await getOrderPhotos(orderId);
                setPhotos(photosResponse.data?.photos || []);
            } catch {
                setPhotos([]);
            } finally {
                setPhotosLoading(false);
            }
        };
        fetchData();
    }, [orderId]);



    if (loading) return <DetailSkeleton />;

    if (!order && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Pedido não encontrado</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    O pedido solicitado não existe ou foi removido.
                </p>
                <Button variant="outline" className="mt-6 gap-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para a lista
                </Button>
            </div>
        );
    }

    const checkedCount = packages.filter((p) => p.status === "checked").length;
    const totalCount = packages.length;

    return (
        <div className="space-y-5 px-6">

            {/* ── Breadcrumb + Header ── */}
            <div className="flex flex-col gap-3">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <button
                        onClick={() => navigate("/orders")}
                        className="hover:text-foreground transition-colors"
                    >
                        Ordens de Carregamento
                    </button>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-foreground font-medium">Detalhes</span>
                </div>

                {/* Título + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-9 w-9 shrink-0"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                {order.customer || "Cliente não informado"}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Ordem #{order.external_id}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={order.status} size="lg" />
                </div>
            </div>

            {/* ── Timeline ── */}
            <Card className="overflow-hidden">
                <CardContent className="pt-5 pb-5 px-6">
                    <StatusTimeline status={order.status} />
                </CardContent>
            </Card>

            {/* ── Alerta de divergência / observação ── */}
            <OrderFeedbackCard status={order.status} justification={order.justification} />

            {/* ── Conteúdo principal ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Coluna principal */}
                <div className="md:col-span-2 space-y-5">

                    {/* Informações da Carga */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                                    <Package className="h-3.5 w-3.5 text-primary" />
                                </div>
                                Informações da Carga e Logística
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoItem icon={User} label="Cliente / Destinatário" value={order.customer || order.customerName} />
                                <InfoItem icon={Navigation} label="Destino" value={order.destination} />
                                <InfoItem icon={Truck} label="Transportadora" value={order.carrier} />
                                <InfoItem icon={User} label="Motorista Responsável" value={order.driver} />
                                <InfoItem icon={Package} label="Veículo e Placa" value={order.vehicle} />
                                <InfoItem icon={LayoutDashboard} label="Doca de Operação" value={order.dock} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Itens da Ordem */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                                        <Activity className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Itens da Ordem
                                </CardTitle>
                                {totalCount > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                                            checkedCount === totalCount
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                        )}>
                                            {checkedCount}/{totalCount} conferidos
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex flex-col w-full border-2 border-dashed rounded-xl min-h-[200px] bg-muted/20">
                                {packages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground min-h-[180px]">
                                        <Package className="h-10 w-10 mb-3 opacity-20" />
                                        <p className="text-sm">Nenhum item registrado para esta ordem.</p>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col divide-y divide-border/50">
                                        {packages.map((pkg, index) => (
                                            <div
                                                key={pkg.id || index}
                                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 w-36 shrink-0">
                                                    <Package className={cn(
                                                        "h-4 w-4",
                                                        pkg.status === "checked" ? "text-emerald-500" : "text-muted-foreground"
                                                    )} />
                                                    <span className={cn(
                                                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                                                        pkg.status === "checked"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    )}>
                                                        {pkg.status === "checked" ? "Conferido" : "Pendente"}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 flex-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">ID do Pacote</span>
                                                        <span className="text-sm font-medium truncate" title={pkg.unique_package_code}>
                                                            {pkg.unique_package_code || "-"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Quantidade</span>
                                                        <span className="text-sm font-medium">{pkg.quantity_in_package || "-"}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Data</span>
                                                        <span className="text-sm">
                                                            {pkg.checked_at
                                                                ? new Date(pkg.checked_at).toLocaleDateString("pt-BR")
                                                                : "-"}
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

                    {/* Fotos do Carregamento */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                                        <Images className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    Fotos do Carregamento
                                </CardTitle>
                                {photos.length > 0 && (
                                    <span className="text-xs text-muted-foreground">{photos.length} foto(s)</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {photosLoading ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                                    ))}
                                </div>
                            ) : photos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                                    <Images className="h-9 w-9 mb-2 opacity-20" />
                                    <p className="text-sm">Nenhuma foto disponível para esta ordem.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {photos.map((photo, index) => (
                                        <button
                                            key={photo.id || index}
                                            type="button"
                                            onClick={() => setSelectedPhoto(photo)}
                                            className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm transition-all hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        >
                                            <img
                                                src={`https://drive.google.com/thumbnail?id=${photo.drive_id}&sz=w400`}
                                                referrerPolicy="no-referrer"
                                                alt={`Foto ${index + 1} da ordem`}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                                                <ZoomIn className="h-7 w-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" strokeWidth={1.5} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna lateral — Resumo */}
                <div className="space-y-5">
                    <Card className="sticky top-[72px]">
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                </div>
                                Resumo da Execução
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-4">
                            <InfoItem icon={User} label="Operador" value={order.operator} />

                            <div className="pt-3 border-t space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Cronograma
                                </p>
                                <InfoItem icon={CalendarIcon} label="Agendado para" value={formatDate(order.scheduled_at)} />
                                <InfoItem icon={CalendarIcon} label="Início" value={formatDate(order.started_at)} />
                                <InfoItem icon={CheckCircle2} label="Conclusão" value={formatDate(order.completed_at)} />
                            </div>

                            <div className="pt-3 border-t grid grid-cols-1 gap-2">
                                <Button
                                    className="w-full gap-2"
                                    disabled
                                    title="Funcionalidade em desenvolvimento"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimir Ordem
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    disabled
                                    title="Funcionalidade em desenvolvimento"
                                >
                                    <Download className="h-4 w-4" />
                                    Exportar CSV
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center">
                                    Em breve disponível
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Lightbox de foto */}
            <Dialog
                open={Boolean(selectedPhoto)}
                onOpenChange={(open) => !open && setSelectedPhoto(null)}
            >
                <DialogContent className="max-w-[95vw] md:max-w-5xl border-none bg-transparent shadow-none p-0 flex justify-center items-center">
                    {selectedPhoto && (
                        <div className="relative flex justify-center items-center w-full h-full">
                            <img
                                src={`https://drive.google.com/thumbnail?id=${selectedPhoto.drive_id}&sz=w1600`}
                                referrerPolicy="no-referrer"
                                alt="Foto ampliada do carregamento"
                                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
                            />
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute -top-4 -right-4 md:-top-6 md:-right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}