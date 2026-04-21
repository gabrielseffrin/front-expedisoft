import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OrderFeedbackCardProps {
    status: string;
    justification?: string | null;
}

export default function OrderFeedbackCard({ status, justification }: OrderFeedbackCardProps) {

    const isDivergence = status === "divergence";
    const isCompletedWithNote = status === "completed" && justification;

    if (!isDivergence && !isCompletedWithNote) return null;

    const config = isDivergence
        ? {
            theme: "border-red-200 bg-red-50/40",
            textTheme: "text-red-800",
            contentTheme: "text-red-900",
            Icon: AlertCircle,
            title: "Atenção: Divergência Detectada",
            prefix: "Justificativa do Operador: ",
            text: justification || "Nenhuma justificativa fornecida pelo operador.",
        }
        : {
            theme: "border-green-200 bg-green-50/40",
            textTheme: "text-green-800",
            contentTheme: "text-green-900",
            Icon: CheckCircle2,
            title: "Observação do Operador",
            prefix: "",
            text: justification,
        };

    return (
        <Card className={config.theme}>
            <CardHeader className="pb-2">
                <div className={`flex items-center gap-2 ${config.textTheme}`}>
                    <config.Icon className="h-5 w-5" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        {config.title}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className={`text-sm leading-relaxed italic ${config.contentTheme}`}>
                    {config.prefix}&quot;{config.text}&quot;
                </p>
            </CardContent>
        </Card>
    );
}