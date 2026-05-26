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
import { useNavigate, Link, useLocation } from "react-router-dom";
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
        <Sidebar>
            <SidebarContent>
                {/* ── Logotipo ── */}
                <div className="flex flex-col items-center px-5 pt-6 pb-5 border-b border-sidebar-border">
                    <img
                        src={newLogo}
                        alt="ExpediSoft"
                        className="w-full max-w-[148px] object-contain"
                        style={{ filter: "brightness(0) invert(1)" }}
                    />
                    <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-medium">
                        Sistema Logístico
                    </span>
                </div>

                {/* ── Navegação ── */}
                <SidebarGroup className="pt-3">
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/35 px-4 mb-1">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5 px-2">
                            {items.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            size="lg"
                                            className={cn(
                                                "rounded-lg transition-all",
                                                isActive
                                                    ? "bg-sidebar-primary/20 text-sidebar-primary hover:bg-sidebar-primary/20 hover:text-sidebar-primary"
                                                    : "text-sidebar-foreground/65 hover:text-sidebar-foreground"
                                            )}
                                        >
                                            <Link to={item.url} className="flex items-center gap-3">
                                                <item.icon
                                                    className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/45"
                                                    )}
                                                />
                                                <span className="font-medium text-sm">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* ── Rodapé ── */}
            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarMenu>
                    {/* Info do usuário */}
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg bg-sidebar-accent/50">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 shrink-0">
                                <span className="text-xs font-bold text-sidebar-primary">{initials}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
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
                            size="lg"
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