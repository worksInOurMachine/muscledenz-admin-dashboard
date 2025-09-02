import { toast } from "sonner";

export const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message + ' ' + "copied to clipboard");
}