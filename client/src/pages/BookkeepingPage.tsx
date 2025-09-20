import ExpenseScanner from "@/components/ExpenseScanner";
import Dashboard from "@/components/Dashboard";
import GrantNotifications from "@/components/GrantNotifications";

export default function BookkeepingPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold text-center">
            帳簿管理・経費記録
          </h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        <ExpenseScanner />
        <Dashboard />
        <GrantNotifications />
      </main>
    </div>
  );
}