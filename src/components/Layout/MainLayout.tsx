import { Calendar, Bell, ChevronRight, Home as HomeIcon } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";

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
    const location = useLocation();

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

    const initials = user?.name
        ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#f8fafc]">
                <AppSidebar />

                <main className="flex-1 w-full flex flex-col min-h-screen overflow-hidden">

                    {/* ── Topbar ── */}
                    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-border shadow-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                            <div className="h-4 w-px bg-border" />
                            
                            {/* Breadcrumb nativo */}
                            <nav className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                                    <HomeIcon className="h-4 w-4" />
                                </Link>
                                <ChevronRight className="h-4 w-4 opacity-50" />
                                <span className="font-medium text-foreground">{title}</span>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Data e hora */}
                            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="capitalize">{formattedDate}</span>
                                <span className="font-semibold text-foreground">{formattedTime}</span>
                            </div>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Sino */}
                            <button
                                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                                title="Notificações"
                            >
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Avatar */}
                            <div className="flex items-center gap-2.5 pl-1">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-xs font-bold text-primary">{initials}</span>
                                </div>
                                <div className="hidden md:flex flex-col">
                                    <span className="text-xs font-semibold text-foreground leading-tight">
                                        {user?.name?.split(" ")[0] || "Usuário"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">Gestor</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ── Conteúdo ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 py-6"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </SidebarProvider>
    )
}