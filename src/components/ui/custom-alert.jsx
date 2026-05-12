import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {AlertCircleIcon} from "lucide-react";

export default function CustomAlert({variant = "default", message, error}) {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Alert variant={variant} className="max-w-md">
                <AlertCircleIcon/>
                <AlertTitle>{message}</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    )
}