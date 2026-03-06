import './App.css'
import {AuthProvider} from "@/contexts/AuthContext";
import {useAuth} from "@/hooks/useAuth";
import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";
import type {JSX} from "react";
import LoginPage from "@/pages/Login";
import MainLayout from "@/components/Layout/MainLayout";
import DashboardPage from "@/pages/Dashboards";
import OrdersPage from "@/pages/Orders";

function PrivateRoute({children}: { children: JSX.Element }) {
    const {signed, loading} = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!signed) {
        return <Navigate to={"/"}/>;
    }

    return children;
}

function AppRoutes() {
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
                        <MainLayout title="Orderns de Carregamento" description="Agendar e gerenciar ordens">
                            <OrdersPage />
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