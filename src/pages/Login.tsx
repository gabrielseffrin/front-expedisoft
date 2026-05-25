import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Painel esquerdo — identidade visual */}
            <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
                {/* Padrão de pontos decorativo */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                {/* Círculos decorativos */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />

                {/* Conteúdo central */}
                <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-white tracking-tight">Expedisoft</p>
                            <p className="text-xs text-blue-200 tracking-widest uppercase">Sistema Logístico</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-12 h-0.5 bg-white/20 rounded-full" />

                    {/* Tagline */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-3xl font-bold text-white leading-tight">
                            Gestão inteligente<br />de carregamentos
                        </h2>
                        <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
                            Controle ordens, monitore operadores e acompanhe divergências em tempo real.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {["Agendamento", "Rastreamento", "Divergências", "Relatórios"].map((f) => (
                            <span
                                key={f}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-blue-100 border border-white/10 backdrop-blur-sm"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Painel direito — formulário */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-6 md:p-10">
                {/* Logo mobile */}
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-foreground">Expedisoft</span>
                </div>

                <div className="w-full max-w-sm animate-fade-in-up">
                    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
                        <LoginForm />
                    </div>
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Expedisoft · Sistema de Gestão Logística
                    </p>
                </div>
            </div>
        </div>
    )
}