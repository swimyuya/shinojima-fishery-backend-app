import { BarChart3, Plus, Bot, Gift, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { id: "dashboard", label: "ダッシュボード", icon: BarChart3, path: "/" },
  { id: "assistant", label: "AIアシスタント", icon: Bot, path: "/assistant" },
  { id: "record", label: "記録", icon: Plus, path: "/record" },
  { id: "grant", label: "補助金", icon: Gift, path: "/grant" },
  { id: "settings", label: "設定", icon: Settings, path: "/settings" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="grid grid-cols-5 items-center px-2 py-2 max-w-screen-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path} className="w-full">
              <button
                data-testid={`nav-${item.id}`}
                className={`w-full flex flex-col items-center justify-center min-h-14 px-1 py-2 rounded-lg transition-colors hover-elevate ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium leading-tight text-center">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}