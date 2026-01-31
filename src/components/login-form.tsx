import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useState, type SetStateAction, FormEvent} from "react";
import {useAuth} from "@/hooks/useAuth";
import {authService} from "@/services/auth.service";
import {useNavigate} from "react-router-dom";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentPropsWithoutRef<"form">) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const {signIn} = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        try {
            const {token} = await authService.login({email, password});
            await signIn(token);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Usuário ou senha inválidos.");
        }
    }

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Faça login em sua conta</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email}
                           onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
                           required/>
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                    <Input id="password" type="password" value={password} onChange={(e: {
                        target: { value: SetStateAction<string>; };
                    }) => setPassword(e.target.value)} required/></div>
                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button type="submit" className="w-full">
                    Login
                </Button>
            </div>
        </form>
    )
}
