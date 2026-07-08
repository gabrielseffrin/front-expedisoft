import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    Search,
    Eye,
    RefreshCw,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    FileJson,
    User,
    Filter,
    History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    getIntegrationLogs,
    getStatusChangeLogs,
    getOperatorReadingLogs,
    type IntegrationLog,
    type StatusChangeLog,
    type OperatorReadingLog,
    type LogFilters
} from "@/services/logs.service";
import { getOperators, type UserResponse } from "@/services/user.service";

type LogMode = "integration" | "status-changes" | "operator-readings";

export default function HistoryPage() {
    const [mode, setMode] = useState<LogMode>("integration");
    const [loading, setLoading] = useState<boolean>(false);
    
    // Lista de Operadores para mapear ID -> Nome
    const [operators, setOperators] = useState<UserResponse[]>([]);

    // Dados de logs
    const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
    const [statusChangeLogs, setStatusChangeLogs] = useState<StatusChangeLog[]>([]);
    const [operatorReadingLogs, setOperatorReadingLogs] = useState<OperatorReadingLog[]>([]);

    // Cursors de Paginação
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);
    const [activeCursor, setActiveCursor] = useState<string | undefined>(undefined);
    const [cursorHistory, setCursorHistory] = useState<string[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);

    // Helpers para datas padrão (inicia nos últimos 7 dias)
    const getNDaysAgoStr = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().slice(0, 10);
    };

    // Filtros Comuns (Inicia com range de 7 dias)
    const [startDate, setStartDate] = useState<string>(getNDaysAgoStr(7));
    const [endDate, setEndDate] = useState<string>(getNDaysAgoStr(0));
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [perPage, setPerPage] = useState<number>(10);

    // Filtros Específicos
    const [httpStatusFilter, setHttpStatusFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [readingStatusFilter, setReadingStatusFilter] = useState<string>("all");

    // Modal de Detalhes
    const [selectedIntegrationPayload, setSelectedIntegrationPayload] = useState<Record<string, any> | null>(null);
    const [selectedErrorMessage, setSelectedErrorMessage] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>("");

    // Carrega operadores no mount para resolver os nomes dos usuários nos logs
    useEffect(() => {
        async function fetchOperatorsList() {
            try {
                const list = await getOperators();
                setOperators(list);
            } catch (error) {
                console.error("Erro ao carregar lista de operadores", error);
            }
        }
        fetchOperatorsList();
    }, []);

    // Formatar datas para exibição legível
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    // Resolve o nome do operador / usuário pelo ID
    const getOperatorName = (changedBy: string) => {
        if (!changedBy) return "-";
        const op = operators.find(o => o.id === changedBy);
        if (op) return op.name;
        // Se for um UUID e não estiver mapeado nos operadores carregados
        if (changedBy.length > 20) {
            return `Usuário (${changedBy.substring(0, 8)})`;
        }
        return changedBy;
    };

    // Reset de paginação ao trocar de aba ou aplicar filtro
    const resetPagination = () => {
        setActiveCursor(undefined);
        setCursorHistory([]);
        setPageNumber(1);
    };

    // Mudar de aba
    const handleModeChange = (newMode: LogMode) => {
        setMode(newMode);
        resetPagination();
        setSearchQuery("");
        setStartDate(getNDaysAgoStr(7));
        setEndDate(getNDaysAgoStr(0));
        setHttpStatusFilter("all");
        setStatusFilter("all");
        setReadingStatusFilter("all");
    };

    // Carregar Logs
    const fetchLogs = async () => {
        setLoading(true);
        const commonFilters: LogFilters = {
            per_page: perPage,
            cursor: activeCursor,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        };

        try {
            if (mode === "integration") {
                const filters: LogFilters = {
                    ...commonFilters,
                    endpoint: searchQuery || undefined,
                    http_status: httpStatusFilter !== "all" ? Number(httpStatusFilter) : undefined
                };
                const res = await getIntegrationLogs(filters);
                setIntegrationLogs(res.data);
                setNextCursor(res.next_cursor);
                setPrevCursor(res.prev_cursor);
            } else if (mode === "status-changes") {
                const filters: LogFilters = {
                    ...commonFilters,
                    loading_order_id: searchQuery || undefined,
                    new_status: statusFilter !== "all" ? statusFilter : undefined
                };
                const res = await getStatusChangeLogs(filters);
                setStatusChangeLogs(res.data);
                setNextCursor(res.next_cursor);
                setPrevCursor(res.prev_cursor);
            } else if (mode === "operator-readings") {
                const filters: LogFilters = {
                    ...commonFilters,
                    scanned_code: searchQuery || undefined,
                    status: readingStatusFilter !== "all" ? (readingStatusFilter as "success" | "error") : undefined
                };
                const res = await getOperatorReadingLogs(filters);
                setOperatorReadingLogs(res.data);
                setNextCursor(res.next_cursor);
                setPrevCursor(res.prev_cursor);
            }
        } catch (error) {
            console.error("Erro ao buscar logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [mode, activeCursor, perPage, httpStatusFilter, statusFilter, readingStatusFilter]);

    // Tratar cliques de busca/filtro
    const handleApplyFilters = () => {
        resetPagination();
        fetchLogs();
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setStartDate(getNDaysAgoStr(7));
        setEndDate(getNDaysAgoStr(0));
        setHttpStatusFilter("all");
        setStatusFilter("all");
        setReadingStatusFilter("all");
        resetPagination();
    };

    // Navegar nas páginas
    const handleNextPage = () => {
        if (nextCursor) {
            setCursorHistory(prev => [...prev, activeCursor || ""]);
            setActiveCursor(nextCursor);
            setPageNumber(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (cursorHistory.length > 0) {
            const previous = cursorHistory[cursorHistory.length - 1];
            setCursorHistory(prev => prev.slice(0, -1));
            setActiveCursor(previous || undefined);
            setPageNumber(prev => Math.max(prev - 1, 1));
        }
    };

    const handleRefresh = () => {
        fetchLogs();
    };

    // Helper para placeholders de busca
    const getSearchPlaceholder = () => {
        switch (mode) {
            case "integration": return "Buscar por endpoint...";
            case "status-changes": return "Buscar por ID da Ordem...";
            case "operator-readings": return "Buscar por código lido (PKG)...";
        }
    };

    // Abrir modal de Payload JSON
    const openPayloadModal = (log: IntegrationLog) => {
        setModalTitle(`Payload da Integração - ID ${log.id.substring(0, 8)}`);
        setSelectedIntegrationPayload(log.payload);
        setSelectedErrorMessage(log.error_message);
        setSelectedNote(null);
        setDetailModalOpen(true);
    };

    // Abrir modal de Observação de Status
    const openNoteModal = (log: StatusChangeLog) => {
        setModalTitle(`Observação da Alteração - ID ${log.id.substring(0, 8)}`);
        setSelectedIntegrationPayload(null);
        setSelectedErrorMessage(null);
        setSelectedNote(log.note);
        setDetailModalOpen(true);
    };

    // Abrir modal de Erro de Leitura
    const openErrorModal = (log: OperatorReadingLog) => {
        setModalTitle(`Erro da Leitura - Código ${log.scanned_code}`);
        setSelectedIntegrationPayload(null);
        setSelectedErrorMessage(log.error_message);
        setSelectedNote(null);
        setDetailModalOpen(true);
    };

    return (
        <div className="space-y-4">
            
            {/* ── CARD PRINCIPAL COM TÍTULO E NAVEGAÇÃO / HISTÓRICO ── */}
            <div className="bg-white border-y border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                            <HistoryIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground">Histórico de Operações</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Visualize e filtre logs de integrações, alterações de status e leituras em campo
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Seleção de Modos (Tabs) ── */}
                <div className="flex px-6 border-b border-border bg-slate-50/30">
                    <button
                        onClick={() => handleModeChange("integration")}
                        className={cn(
                            "px-4 py-2.5 font-medium text-xs uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer",
                            mode === "integration"
                                ? "border-primary text-primary font-bold"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Logs de Integração
                    </button>
                    <button
                        onClick={() => handleModeChange("status-changes")}
                        className={cn(
                            "px-4 py-2.5 font-medium text-xs uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer",
                            mode === "status-changes"
                                ? "border-primary text-primary font-bold"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Histórico de Status
                    </button>
                    <button
                        onClick={() => handleModeChange("operator-readings")}
                        className={cn(
                            "px-4 py-2.5 font-medium text-xs uppercase tracking-wider border-b-2 -mb-[2px] transition-all cursor-pointer",
                            mode === "operator-readings"
                                ? "border-primary text-primary font-bold"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Leitura do Operador
                    </button>
                </div>

                {/* ── Filtros ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {/* Busca por texto */}
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={getSearchPlaceholder()}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleApplyFilters()}
                                className="pl-9 w-full h-9"
                            />
                        </div>

                        {/* Filtro Período de Datas */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-card border border-input rounded-md px-2.5 py-1.5 shadow-sm text-sm h-9">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-28 text-muted-foreground"
                                title="Data de Início"
                            />
                            <span className="text-muted-foreground text-xs px-0.5">até</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs w-28 text-muted-foreground"
                                title="Data Fim"
                            />
                        </div>

                        {/* Filtros específicos por Modo */}
                        {mode === "integration" && (
                            <div className="w-40">
                                <Select value={httpStatusFilter} onValueChange={setHttpStatusFilter}>
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="Status HTTP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="202">202 (Sucesso)</SelectItem>
                                        <SelectItem value="400">400 (Erro Requisição)</SelectItem>
                                        <SelectItem value="500">500 (Erro Interno)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode === "status-changes" && (
                            <div className="w-44">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="Novo Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="scheduled">Agendada</SelectItem>
                                        <SelectItem value="in_progress">Carregando</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
                                        <SelectItem value="divergence">Divergência</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {mode === "operator-readings" && (
                            <div className="w-40">
                                <Select value={readingStatusFilter} onValueChange={setReadingStatusFilter}>
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="Resultado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="success">Sucesso</SelectItem>
                                        <SelectItem value="error">Erro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button onClick={handleApplyFilters} size="sm" className="gap-1.5 h-9 text-xs">
                            <Filter className="h-3.5 w-3.5" />
                            Filtrar
                        </Button>

                        {(searchQuery || startDate !== getNDaysAgoStr(7) || endDate !== getNDaysAgoStr(0) || httpStatusFilter !== "all" || statusFilter !== "all" || readingStatusFilter !== "all") && (
                            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-9">
                                Limpar Filtros
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                        <Select value={String(perPage)} onValueChange={val => setPerPage(Number(val))}>
                            <SelectTrigger className="w-[120px] h-9 text-xs">
                                <SelectValue placeholder="Itens/pág" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 por pág</SelectItem>
                                <SelectItem value="10">10 por pág</SelectItem>
                                <SelectItem value="20">20 por pág</SelectItem>
                                <SelectItem value="50">50 por pág</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} className="h-9 w-9">
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Conteúdo / Tabela ── */}
            <div className="px-6 pb-6">
                {/* overflow-x-auto e max-w-full garante que a tabela deslize horizontalmente ao invés de quebrar o layout da tela */}
                <div className="rounded-xl border bg-white dark:bg-card overflow-hidden shadow-sm max-w-full overflow-x-auto">
                    {mode === "integration" && (
                        <Table className="min-w-[800px] table-layout-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID do Log</TableHead>
                                    <TableHead className="w-[160px]">Data e Hora</TableHead>
                                    <TableHead className="w-[220px]">Endpoint</TableHead>
                                    <TableHead className="w-[110px]">Status HTTP</TableHead>
                                    <TableHead>Mensagem de Erro</TableHead>
                                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, idx) => (
                                        <TableRow key={idx}>
                                            {Array.from({ length: 6 }).map((__, tdIdx) => (
                                                <TableCell key={tdIdx}><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : integrationLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs">Nenhum log de integração encontrado.</TableCell>
                                    </TableRow>
                                ) : (
                                    integrationLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-xs font-semibold">{log.id.substring(0, 8)}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formatDate(log.received_at)}</TableCell>
                                            <TableCell>
                                                <span className="font-medium text-xs bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded px-1.5 py-1 max-w-[200px] truncate block font-mono" title={log.endpoint}>
                                                    {log.endpoint}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                                                    log.http_status >= 200 && log.http_status < 300 
                                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                )}>
                                                    {log.http_status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs max-w-[220px] truncate block text-red-500 font-medium" title={log.error_message || ""}>
                                                    {log.error_message || <span className="text-muted-foreground opacity-30">-</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openPayloadModal(log)} title="Ver Payload" className="h-8 w-8">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {mode === "status-changes" && (
                        <Table className="min-w-[900px] table-layout-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID do Log</TableHead>
                                    <TableHead className="w-[160px]">Data e Hora</TableHead>
                                    <TableHead className="w-[100px]">Ordem ID</TableHead>
                                    <TableHead className="w-[120px]">Status Anterior</TableHead>
                                    <TableHead className="w-[120px]">Novo Status</TableHead>
                                    <TableHead className="w-[160px]">Usuário</TableHead>
                                    <TableHead>Justificativa/Observação</TableHead>
                                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, idx) => (
                                        <TableRow key={idx}>
                                            {Array.from({ length: 8 }).map((__, tdIdx) => (
                                                <TableCell key={tdIdx}><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : statusChangeLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-xs">Nenhum log de alteração de status encontrado.</TableCell>
                                    </TableRow>
                                ) : (
                                    statusChangeLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-xs font-semibold">{log.id.substring(0, 8)}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formatDate(log.changed_at)}</TableCell>
                                            <TableCell className="font-mono text-xs">{log.loading_order_id.substring(0, 8)}</TableCell>
                                            <TableCell><StatusBadge status={log.old_status} showDot={false} /></TableCell>
                                            <TableCell><StatusBadge status={log.new_status} /></TableCell>
                                            <TableCell className="text-xs font-medium">
                                                <div className="flex items-center gap-1.5 max-w-[150px] truncate" title={getOperatorName(log.changed_by)}>
                                                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    <span className="truncate">{getOperatorName(log.changed_by)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs max-w-[200px] truncate block text-muted-foreground" title={log.note || ""}>
                                                    {log.note || <span className="opacity-30">-</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.note ? (
                                                    <Button variant="ghost" size="icon" onClick={() => openNoteModal(log)} title="Ver Justificativa" className="h-8 w-8">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground opacity-30 px-3 text-xs">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {mode === "operator-readings" && (
                        <Table className="min-w-[950px] table-layout-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[160px]">Data e Hora</TableHead>
                                    <TableHead className="w-[100px]">Ordem</TableHead>
                                    <TableHead className="w-[130px]">Código Lido</TableHead>
                                    <TableHead className="w-[150px]">Cliente</TableHead>
                                    <TableHead className="w-[150px]">Operador</TableHead>
                                    <TableHead className="w-[110px]">Resultado</TableHead>
                                    <TableHead>Mensagem de Erro</TableHead>
                                    <TableHead className="w-[80px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, idx) => (
                                        <TableRow key={idx}>
                                            {Array.from({ length: 8 }).map((__, tdIdx) => (
                                                <TableCell key={tdIdx}><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : operatorReadingLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-xs">Nenhum log de leitura de operador encontrado.</TableCell>
                                    </TableRow>
                                ) : (
                                    operatorReadingLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground">{formatDate(log.scanned_at)}</TableCell>
                                            <TableCell className="font-mono text-xs">{log.loading_order_id.substring(0, 8)}</TableCell>
                                            <TableCell className="font-mono text-xs font-semibold text-primary truncate max-w-[120px]" title={log.scanned_code}>{log.scanned_code}</TableCell>
                                            <TableCell className="text-xs truncate max-w-[140px]" title={log.customer_name}>{log.customer_name}</TableCell>
                                            <TableCell className="text-xs font-medium truncate max-w-[140px]" title={log.operator_name}>{log.operator_name}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                    log.status === "success" 
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                                        : "bg-red-50 text-red-700 border border-red-200"
                                                )}>
                                                    <span className={cn("h-1.5 w-1.5 rounded-full", log.status === "success" ? "bg-emerald-500" : "bg-red-500")} />
                                                    {log.status === "success" ? "Sucesso" : "Erro"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs max-w-[200px] truncate block text-red-500 font-medium" title={log.error_message || ""}>
                                                    {log.error_message || <span className="text-muted-foreground opacity-30">-</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.error_message ? (
                                                    <Button variant="ghost" size="icon" onClick={() => openErrorModal(log)} title="Ver Detalhes do Erro" className="h-8 w-8">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground opacity-30 px-3 text-xs">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {/* ── Paginação Cursor-Based ── */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-xs text-muted-foreground">
                            Página <span className="font-semibold text-foreground">{pageNumber}</span> • Navegação por cursor
                        </span>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={cursorHistory.length === 0 || loading}
                                className="h-8 flex items-center gap-1 text-xs"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={!nextCursor || loading}
                                className="h-8 flex items-center gap-1 text-xs"
                            >
                                Próximo
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal de Detalhes ── */}
            <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
                <DialogContent className="max-w-xl sm:max-w-2xl bg-white dark:bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            {modalTitle}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {/* Se for Payload de Integração */}
                        {selectedIntegrationPayload && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                        <FileJson className="h-3.5 w-3.5" /> Payload Recebido (JSON)
                                    </h4>
                                    <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre border border-slate-800 leading-relaxed shadow-inner">
                                        {JSON.stringify(selectedIntegrationPayload, null, 2)}
                                    </pre>
                                </div>
                                {selectedErrorMessage && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                                        <h5 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                                            <AlertTriangle className="h-3.5 w-3.5" /> Erro Retornado pelo Sistema
                                        </h5>
                                        <p className="text-xs text-red-600 dark:text-red-300 font-medium">{selectedErrorMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Se for Observação/Justificativa de Status */}
                        {selectedNote && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border rounded-lg">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                    Observação/Justificativa da Alteração
                                </h4>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                    "{selectedNote}"
                                </p>
                            </div>
                        )}

                        {/* Se for Erro de Leitura */}
                        {selectedErrorMessage && !selectedIntegrationPayload && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
                                    <AlertTriangle className="h-4 w-4" /> Detalhes da Falha de Leitura
                                </h4>
                                <p className="text-sm text-red-600 dark:text-red-300 font-medium leading-relaxed">
                                    {selectedErrorMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-2">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm">Fechar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
