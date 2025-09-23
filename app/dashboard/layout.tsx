
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
// import { DashboardHeader } from "@/components/dashboard-header"
// import { Toaster } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <DashboardHeader /> */}
        <div className="flex flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
