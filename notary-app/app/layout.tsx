import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "NotaryPro — Multi-Tenant Notary Management",
    template: "%s | NotaryPro",
  },
  description:
    "Professional multi-tenant notary management system. Manage clients, appointments, documents, and transactions with enterprise-grade security.",
  keywords: ["notary", "management", "appointments", "documents", "legal"],
};

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-base text-base">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--bg-surface)",
                    color: "var(--text-base)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    fontFamily: "var(--font-body)",
                  },
                  success: {
                    iconTheme: { primary: "var(--primary)" as string, secondary: "var(--bg-surface)" as string },
                  },
                  error: {
                    iconTheme: { primary: "#f87171", secondary: "var(--bg-surface)" as string },
                  },
                }}
              />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
