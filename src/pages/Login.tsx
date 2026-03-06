import { LoginForm } from "@/components/login-form"
export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-muted w-full relative hidden lg:block">
                <div className="flex items-center justify-center h-full">
                    <img
                        src="../src/images/img.png"
                        alt="Imageeeeee"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    )
}