"use client";

import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/app/theme-context";

function ThemedToaster() {
  const { dark } = useTheme();
  return (
    <Toaster
      richColors
      position="top-right"
      closeButton
      theme={dark ? "dark" : "light"}
      toastOptions={{ duration: 4500 }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
