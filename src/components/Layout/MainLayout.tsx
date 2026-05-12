import { Calendar } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import React, { useEffect, useState } from "react";

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

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = now.toLocaleDateString('pt-BR', {
        weekday: "long",
        day: '2-digit',
        month: "long",
        year: 'numeric',
    }) + ', ' + now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full ">

                <AppSidebar />

                <main className="flex-1 w-full">

                    <div className="p-4 border-b bg-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h2 className="font-semibold text-lg">
                                {title}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formattedTime}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white text-left">
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>

                    <div className="">
                        {children}
                    </div>

                </main>
            </div>
        </SidebarProvider>
    )
}