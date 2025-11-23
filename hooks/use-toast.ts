// src/hooks/use-toast.ts
"use client";

export type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

/**
 * Hook minimalista compatible con toast({ title, description }).
 * Ahora tus llamadas:
 *   toast({ title: "Fox created!", description: "..." })
 * van a tipar perfecto.
 *
 * Por ahora solo hace console.log, podés reemplazarlo
 * por tu sistema real de toasts (shadcn, sonner, etc.).
 */
export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    // TODO: conectar con tu UI real de toasts
    if (typeof window !== "undefined") {
      console.log(
        "[toast]",
        variant ? `[${variant}]` : "",
        title ?? "",
        description ?? ""
      );
    }
  };

  return { toast };
}
