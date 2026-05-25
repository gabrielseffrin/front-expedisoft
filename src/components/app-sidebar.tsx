import { Home, Package, LogOut, History, Cog, Truck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu, SidebarMenuItem
} from "@/components/ui/sidebar";
import { SidebarMenuButton } from "./ui/sidebar";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Ordens de Carregamento",
        url: "/orders",
        icon: Package,
    },
    {
        title: "Histórico",
        url: "/history",
        icon: History,
    },
    {
        title: "Configurações",
        url: "/config",
        icon: Cog,
    },
]

export function AppSidebar() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.log("Erro ao fazer logout: ", error);
        }
    }

    const initials = user?.name
        ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
        : "?";

    return (
        <Sidebar>
            <SidebarContent>
                {/* Header / Marca */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 shrink-0">
                        <Truck className="h-4 w-4 text-sidebar-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-sidebar-foreground leading-none">Expedisoft</span>
                        <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest mt-0.5">Logística</span>
                    </div>
                </div>

                <SidebarGroup className="pt-4">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-4 mb-1">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                to={item.url}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                                    isActive
                                                        ? "bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/20"
                                                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                                                    )}
                                                />
                                                <span>{item.title}</span>
                                                {isActive && (
                                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarMenu>
                    {/* Info do usuário */}
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-2 mb-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 shrink-0">
                                <span className="text-xs font-bold text-sidebar-primary">{initials}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name || "Usuário"}</span>
                                <span className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email || ""}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Sair da conta</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}