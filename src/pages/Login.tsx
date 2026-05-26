import { LoginForm } from "@/components/login-form"
import newLogo from "@/images/new-logo.webp"

export default function LoginPage() {
    return (
        <div className="flex h-screen overflow-hidden lg:grid lg:grid-cols-2">
            {/* ── Painel esquerdo — identidade visual ── */}
            <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#050e1f] via-[#0c1a3e] to-[#0f2057]">
                {/* Padrão de pontos */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Blob decorativo inferior esquerdo */}
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#3b82f6]/20 blur-3xl" />
                {/* Blob decorativo superior direito */}
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

                {/* Conteúdo central */}
                <div className="relative z-10 flex flex-col items-center gap-10 px-14 text-center max-w-lg">
                    {/* Logo */}
                    <img
                        src={newLogo}
                        alt="ExpediSoft — Sistema Logístico"
                        className="w-64 object-contain drop-shadow-2xl"
                    />

                    {/* Divisor */}
                    <div className="w-16 h-px bg-white/25 rounded-full" />

                    {/* Tagline */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-3xl font-bold text-white leading-tight">
                            Gestão inteligente<br />de carregamentos
                        </h2>
                        <p className="text-blue-200 text-sm leading-relaxed">
                            Controle ordens, monitore operadores e acompanhe divergências em tempo real com total rastreabilidade.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {["Agendamento", "Rastreamento", "Divergências", "Relatórios"].map((f) => (
                            <span
                                key={f}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-blue-100 border border-white/15 backdrop-blur-sm"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Rodapé */}
                <p className="absolute bottom-6 text-[11px] text-blue-300/60 tracking-wide">
                    © {new Date().getFullYear()} ExpediSoft · Todos os direitos reservados
                </p>
            </div>

            {/* ── Painel direito — formulário ── */}
            <div className="flex flex-col items-center justify-center bg-[#f8fafc] p-6 md:p-10 h-full">
                {/* Logo mobile */}
                <div className="flex items-center justify-center mb-8 lg:hidden">
                    <img
                        src={newLogo}
                        alt="ExpediSoft"
                        className="h-10 object-contain"
                    />
                </div>

                <div className="w-full max-w-sm animate-fade-in-up">
                    <div className="rounded-2xl border border-border bg-white px-8 py-8 shadow-sm">
                        <LoginForm />
                    </div>
                    <p className="mt-5 text-center text-xs text-muted-foreground">
                        Sistema de Gestão Logística · v2.0
                    </p>
                </div>
            </div>
        </div>
    )
}