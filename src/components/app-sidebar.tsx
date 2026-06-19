import { Home, Package, LogOut, History, Cog } from "lucide-react"
import { useAuth } from "@/hooks/useAuth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import newLogo from "@/images/new-logo.webp";
import { cn } from "@/lib/utils";

const items = [
    { title: "Dashboard",              url: "/dashboard", icon: Home },
    { title: "Ordens de Carregamento", url: "/orders",    icon: Package },
    { title: "Histórico",              url: "/history",   icon: History },
    { title: "Configurações",          url: "/config",    icon: Cog },
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
        <Sidebar collapsible="icon">
            <SidebarContent>
                {/* ── Logotipo ── */}
                <div className="flex flex-col items-center px-5 pt-6 pb-5 border-b border-sidebar-border group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-4">
                    <img
                        src={newLogo}
                        alt="ExpediSoft"
                        className="w-full max-w-[148px] object-contain transition-all group-data-[collapsible=icon]:hidden"
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-8 h-8 rounded bg-primary/20 text-primary-foreground font-bold text-xs">
                        ES
                    </div>
                    <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-medium transition-all group-data-[collapsible=icon]:hidden">
                        Sistema Logístico
                    </span>
                </div>

                {/* ── Navegação ── */}
                <SidebarGroup className="pt-3">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/35 px-4 mb-1 group-data-[collapsible=icon]:hidden">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {items.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                            onClick={() => navigate(item.url)}
                                            className={cn(
                                                "rounded-lg transition-all cursor-pointer",
                                                isActive
                                                    ? "bg-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/20 hover:text-sidebar-primary"
                                                    : "text-sidebar-foreground/65 hover:text-sidebar-foreground"
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "h-4 w-4 shrink-0",
                                                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/45"
                                                )}
                                            />
                                            <span className="font-medium text-sm">{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Rodapé ── */}
            <SidebarFooter className="border-t border-sidebar-border p-2">
                <SidebarMenu>
                    {/* Info do usuário */}
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 shrink-0">
                                <span className="text-xs font-bold text-sidebar-primary">{initials}</span>
                            </div>
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-xs font-semibold text-sidebar-foreground truncate">
                                    {user?.name || "Usuário"}
                                </span>
                                <span className="text-[10px] text-sidebar-foreground/40 truncate">
                                    {user?.email || ""}
                                </span>
                            </div>
                        </div>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Sair da conta"
                            className="rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium">Sair da conta</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}