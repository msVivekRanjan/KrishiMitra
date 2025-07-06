"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <div className="fixed left-0 top-0 h-16 md:hidden flex items-center p-4 z-10 bg-background/80 backdrop-blur-sm w-full">
          <AppSidebar />
        </div>
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <main className="flex-1 flex flex-col pt-16 md:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
