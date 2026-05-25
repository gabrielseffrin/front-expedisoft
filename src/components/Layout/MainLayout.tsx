import { Calendar, Bell } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function MainLayout({
    children,
    title = "Área do Gestor",
    description
}: MainLayoutProps) {

    const [now, setNow] = useState(new Date());
    const { user } = useAuth();

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = now.toLocaleDateString('pt-BR', {
        weekday: "long",
        day: '2-digit',
        month: "long",
    });

    const formattedTime = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-slate-50">
                <AppSidebar />

                <main className="flex-1 w-full flex flex-col min-h-screen overflow-hidden">
                    {/* Topbar */}
                    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-border shadow-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                            <div className="h-4 w-px bg-border" />
                            <div>
                                <h2 className="font-semibold text-sm text-foreground leading-tight">{title}</h2>
                                {description && (
                                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">{description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Data e hora */}
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="capitalize">{formattedDate}</span>
                                <span className="font-semibold text-foreground">{formattedTime}</span>
                            </div>

                            <div className="h-4 w-px bg-border hidden sm:block" />

                            {/* Notificação (decorativo) */}
                            <button className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Avatar do usuário */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-xs font-bold text-primary">
                                        {user?.name
                                            ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                                            : "?"}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-foreground hidden md:block">
                                    {user?.name?.split(" ")[0] || "Usuário"}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Conteúdo */}
                    <div className="flex-1 p-5 md:p-6 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}