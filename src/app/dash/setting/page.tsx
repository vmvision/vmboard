import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
export default function SettingPage() {
  return (
    <SidebarProvider>
      <AppSidebar className="my-sidebar shadow-xl rounded-r-lg" />
        <main>  
          Setting
        </main>
    </SidebarProvider>
  )
}
