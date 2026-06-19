import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState, type SetStateAction, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { token } = await authService.login({ email, password });
            await signIn(token);
            navigate("/dashboard");
        } catch (err: any) {
            console.error(err);
            const status = err?.response?.status;
            if (status === 401 || status === 422) {
                setError("E-mail ou senha inválidos. Verifique suas credenciais.");
            } else {
                setError("Não foi possível conectar ao servidor. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-2">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h1>
                <p className="text-sm text-muted-foreground">
                    Faça login para acessar o painel de controle
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com.br"
                        value={email}
                        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-10"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="h-10 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-sm text-destructive leading-snug">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-10 font-semibold"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </Button>
            </div>
        </form>
    )
}
