"use client"

import type React from "react"

// import { useSession } from "next-auth/react"
// import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SessionProvider } from "next-auth/react"
import "@/styles/globals.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const { data: session, status } = useSession()

  // if (status === "loading") {
  //   return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  // }

  // if (!session) {
  //   redirect("/auth/signin")
  // }

  return (
    
    <SessionProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <html>
          <body>
            
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </body>

        </html>
      </SidebarInset>
    </SidebarProvider>
    </SessionProvider>
  )
}
