import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAlerts } from "@/services/alert/alert-service";
import { AlertProvider } from "@/store/AlertProvider";
import { QueryProvider } from "@/store/QueryProvider";

export const dynamic = "force-dynamic";

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
