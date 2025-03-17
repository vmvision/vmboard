import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  return (
    <div className={cn("w-64 bg-background border-r h-auto", className)}>
      <div className="py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Application
          </h2>
          <nav className="space-y-1">
            {items.map((item) => (
              <a
                key={item.title}
                href={item.url}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
