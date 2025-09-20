import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import BottomNavigation from "@/components/BottomNavigation";
import HomePage from "@/pages/HomePage";
import RecordPage from "@/pages/RecordPage";
import GrantPage from "@/pages/GrantPage";
import SettingsPage from "@/pages/SettingsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/record" component={RecordPage} />
      <Route path="/grant" component={GrantPage} />
      <Route path="/assistant" component={AIAssistantPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Router />
            <BottomNavigation />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
