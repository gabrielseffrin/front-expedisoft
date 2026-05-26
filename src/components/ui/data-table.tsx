"use client"

import React from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    type SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]

    // 🔥 controle externo
    page: number
    totalPages: number
    onPageChange: (page: number) => void

    isLoading?: boolean
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             page,
                                             totalPages,
                                             onPageChange,
                                             isLoading = false,
                                         }: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>("");

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
        },
    })

    return (
        <div className="w-full">

            <div className="flex items-center px-4 py-3">
                <Input
                    placeholder="Digite para buscar..."
                    value={globalFilter}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setGlobalFilter(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>

            <div className="overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            header.column.getCanSort() ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="h-8 flex items-center justify-start px-2 py-1 -ml-2 text-muted-foreground hover:text-foreground font-medium text-xs uppercase tracking-wider"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                                                </Button>
                                            ) : (
                                                <div className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {columns.map((_, j) => (
                                        <TableCell key={`cell-${j}`}>
                                            <Skeleton className="h-4 w-full max-w-[150px]" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                                            <Inbox className="h-6 w-6 opacity-60" />
                                        </div>
                                        <p className="text-base font-medium text-foreground">Nenhum resultado</p>
                                        <p className="text-sm mt-1">Não encontramos nada correspondente a esta busca.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-white dark:bg-card">
                <span className="text-sm text-muted-foreground">
                    Exibindo página {page} de {totalPages}
                </span>

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.max(page - 1, 1))}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Numeric Pagination logic (simplified) */}
                    <div className="flex items-center space-x-1 px-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .map((p, index, array) => {
                                const isGap = index > 0 && p - array[index - 1] > 1;
                                return (
                                    <React.Fragment key={p}>
                                        {isGap && (
                                            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </div>
                                        )}
                                        <Button
                                            variant={page === p ? "default" : "ghost"}
                                            size="icon"
                                            className="h-8 w-8 text-sm"
                                            onClick={() => onPageChange(p)}
                                            disabled={isLoading}
                                        >
                                            {p}
                                        </Button>
                                    </React.Fragment>
                                );
                            })}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                        disabled={page === totalPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}