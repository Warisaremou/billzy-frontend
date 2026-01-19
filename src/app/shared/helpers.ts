import { toast } from "ngx-sonner";

export function handleRequestError(error: any) {
  const errorMessage = error?.error?.message;
  toast.error(Array.isArray(errorMessage) ? errorMessage.join("\n") : errorMessage || "Une erreur est survenue.");
}
