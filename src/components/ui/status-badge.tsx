import { cn } from "@/lib/utils";

export type OrderStatus = "pending" | "scheduled" | "in_progress" | "completed" | "divergence";

interface StatusConfig {
    label: string;
    className: string;
    dot: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    pending: {
        label: "Pendente",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-400",
    },
    scheduled: {
        label: "Agendada",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
        dot: "bg-blue-500",
    },
    in_progress: {
        label: "Carregando",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        dot: "bg-indigo-500",
    },
    completed: {
        label: "Concluído",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
    },
    divergence: {
        label: "Divergência",
        className: "bg-red-50 text-red-700 border border-red-200",
        dot: "bg-red-500",
    },
};

interface StatusBadgeProps {
    status: string;
    className?: string;
    showDot?: boolean;
    size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, showDot = true, size = "sm" }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? {
        label: status,
        className: "bg-slate-50 text-slate-600 border border-slate-200",
        dot: "bg-slate-400",
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-sm font-semibold uppercase tracking-wide",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-medium",
                sizeClasses[size],
                config.className,
                className
            )}
        >
            {showDot && (
                <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
            )}
            {config.label}
        </span>
    );
}
