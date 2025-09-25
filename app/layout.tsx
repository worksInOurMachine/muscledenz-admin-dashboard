import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import "@/styles/globals.css";
import SideBarProvider from "@/components/providers/SideBarProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getServerSession(authOptions);

  return (
    <html>
      <body>
        <AuthProvider>
          <SideBarProvider>
            <AppSidebar />
            <SidebarInset>
              <DashboardHeader />
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full min-h-full">
                {children}
              </div>
            </SidebarInset>
          </SideBarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
