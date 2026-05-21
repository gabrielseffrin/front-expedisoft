import './App.css'
import {AuthProvider} from "@/contexts/AuthContext";
import {useAuth} from "@/hooks/useAuth";
import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";
import type {JSX} from "react";
import LoginPage from "@/pages/Login";
import MainLayout from "@/components/Layout/MainLayout";
import DashboardPage from "@/pages/Dashboards";
import OrdersPage from "@/pages/Orders";
import OrderDetails from "@/pages/OrderDetails";

export function PrivateRoute({children}: { children: JSX.Element }) {
    const {signed, loading} = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!signed) {
        return <Navigate to={"/"}/>;
    }

    return children;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage/>}/>


            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <MainLayout title="Dashboard" description="Visão geral do sistema">
                            <DashboardPage />
                        </MainLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <MainLayout title="Ordens de Carregamento" description="Agendar e gerenciar ordens">
                            <OrdersPage />
                        </MainLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/order-datails/:orderId"
                element={
                    <PrivateRoute>
                        <MainLayout title="Detalhes da Ordem" description="Informações detalhadas sobre a ordem selecionada">
                            <OrderDetails />
                        </MainLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <PrivateRoute>
                        <MainLayout title="Histórico" description="Histórico de pedidos e operações">
                            <div className="flex h-screen items-center justify-center">Histórico - Protected Route</div>
                        </MainLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/config"
                element={
                    <PrivateRoute>
                        <MainLayout title="Configurações" description="Configurações do sistema">
                            <div className="flex h-screen items-center justify-center">Configurações - Protected Route</div>
                        </MainLayout>

                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes/>
            </AuthProvider>
        </BrowserRouter>
    );
}