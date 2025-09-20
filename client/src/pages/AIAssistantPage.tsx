import AIAssistant from "@/components/AIAssistant";

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold text-center">
            AI経営アドバイザー
          </h1>
          <p className="text-sm text-center text-muted-foreground mt-1">
            音声でお話しして経営の相談ができます
          </p>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        <AIAssistant />
      </main>
    </div>
  );
}