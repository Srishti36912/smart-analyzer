import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Upload,
  Sparkles,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/upload", icon: Upload, label: "Upload Data" },
  { to: "/cleaning", icon: Sparkles, label: "Data Cleaning" },
  { to: "/analysis", icon: BarChart3, label: "Analysis" },
  { to: "/reports", icon: FileText, label: "Reports" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col glass transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient shadow-lg">
            <Database className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground truncate">
            Smart Analyzer
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
