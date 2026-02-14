import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/error/ErrorBoundary";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { getAlerts } from "@/lib/services/alertService";
import { AlertProvider } from "@/store/AlertProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectCollab",
  description:
    "Zarządzaj swoimi projektami i współpracój w zespole bez przeszkód.",
  appleWebApp: {
    title: "ProjectCollab",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const alerts = await getAlerts();

  return (
    <html lang="pl">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <ErrorBoundary>
          <QueryProvider>
            <AlertProvider initial={alerts}>
              <TooltipProvider>{children}</TooltipProvider>
            </AlertProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
