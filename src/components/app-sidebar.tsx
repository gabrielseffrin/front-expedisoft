import { Home, Package, LogOut, History, Cog } from "lucide-react"
import {useAuth} from "@/hooks/useAuth";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu, SidebarMenuItem
} from "@/components/ui/sidebar";
import { SidebarMenuButton } from "./ui/sidebar";
import {useNavigate, Link} from "react-router-dom";

const items = [
    {
        title: "Início",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Ordens de Carregamentos",
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

    async function handleLogout() {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.log("Erro ao fazer logout: ", error);
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Expedisoft</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600">
                            <LogOut />
                            <span>Sair ({user?.name})</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}