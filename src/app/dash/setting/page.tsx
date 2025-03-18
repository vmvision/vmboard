import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
export default function SettingPage() {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarTrigger/>
      <main>
        <h1>setting</h1>
      </main>
    </SidebarProvider>
  )
}
