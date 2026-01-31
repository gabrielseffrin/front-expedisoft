import {Calendar} from "lucide-react"
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"
import React from "react";

export default function MainLayout({children}: { children: React.ReactNode }) {

    const time = new Date();
    const formattedTime = time.toLocaleTimeString([], {
        weekday: "long",
        day: '2-digit',
        month: "long",
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric'
    });

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar/>

                <main className="flex-1 w-full bg-gray-50/50">

                    <div className="p-4 border-b bg-white flex items-center gap-4">
                        <SidebarTrigger/>
                        <h2 className="font-semibold text-lg">Área do Gestor</h2>

                    </div>

                    <div className="p-4 bg-white flex items-center gap-4">
                        <Calendar/> {formattedTime}
                    </div>


                    <div className="p-6">
                        {children}
                    </div>

                </main>
            </div>
        </SidebarProvider>
    )
}