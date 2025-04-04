import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: "white",
          color: "#333",
        },
        success: {
          style: {
            background: "#1a3a8f", // Primary blue
            color: "white",
            border: "none",
          },
        },
        error: {
          style: {
            background: "#EF4444", // Error red
            color: "white",
            border: "none",
          },
        },
      }}
    />
  );
}