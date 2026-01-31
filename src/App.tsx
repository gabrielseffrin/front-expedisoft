import './App.css'
import {AuthProvider} from "@/contexts/AuthContext";
import {useAuth} from "@/hooks/useAuth";
import {BrowserRouter, Navigate, Routes, Route} from "react-router-dom";
import type {JSX} from "react";
import LoginPage from "@/pages/Login";
import MainLayout from "@/components/Layout/MainLayout";
import DashboardPage from "@/pages/Dashboards";

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
                        <MainLayout>
                            <DashboardPage />
                        </MainLayout>

                    </PrivateRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <div className="flex h-screen items-center justify-center">Orders - Protected Route</div>
                        </MainLayout>

                    </PrivateRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <div className="flex h-screen items-center justify-center">Histórico - Protected Route</div>
                        </MainLayout>

                    </PrivateRoute>
                }
            />
            <Route
                path="/config"
                element={
                    <PrivateRoute>
                        <MainLayout>
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