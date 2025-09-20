import { AlertTriangle, Calendar, DollarSign, CheckCircle, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GrantNotifications from "@/components/GrantNotifications";

export default function GrantPage() {
  // 補助金・助成金情報（実際の環境では別のAPIから取得）
  const grants = [
    {
      id: 1,
      title: "令和6年度 漁業経営基盤強化促進事業",
      category: "設備投資",
      amount: "上限500万円",
      deadline: "2025年1月31日",
      status: "申請可能",
      description: "漁船・漁具の更新、省エネ機器導入に対する補助",
      requirements: "漁業経営改善計画の策定が必要",
      applicationUrl: "https://example.com/grant1",
      urgent: true
    },
    {
      id: 2,
      title: "水産業成長産業化沿岸地域創出事業",
      category: "地域振興",
      amount: "上限200万円",
      deadline: "2025年3月15日",
      status: "申請可能",
      description: "地域の水産業振興・6次産業化への取り組み支援",
      requirements: "地域協議会への参加が必要",
      applicationUrl: "https://example.com/grant2",
      urgent: false
    },
    {
      id: 3,
      title: "漁業構造改革総合対策事業",
      category: "構造改革",
      amount: "上限1000万円",
      deadline: "2024年12月15日",
      status: "申請済み",
      description: "漁業の生産性向上・競争力強化のための総合的支援",
      requirements: "漁業協同組合との連携が必要",
      applicationUrl: null,
      urgent: false
    }
  ];

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (status === "申請可能" && urgent) {
      return <Badge variant="destructive" className="text-xs">緊急</Badge>;
    } else if (status === "申請可能") {
      return <Badge variant="default" className="text-xs">申請可能</Badge>;
    } else if (status === "申請済み") {
      return <Badge variant="secondary" className="text-xs">申請済み</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-xl font-bold text-center">
            補助金・助成金情報
          </h1>
          <p className="text-sm text-center text-muted-foreground mt-1">
            利用可能な支援制度と申請状況
          </p>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-6">
        {/* 重要な通知 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-primary" />
              重要な通知
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GrantNotifications />
          </CardContent>
        </Card>

        {/* 利用可能な補助金一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">利用可能な補助金・助成金</h2>
            <Button variant="outline" size="sm" data-testid="button-refresh-grants">
              最新情報を取得
            </Button>
          </div>

          {grants.map((grant) => (
            <Card key={grant.id} className="hover-elevate" data-testid={`grant-${grant.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2">
                      {grant.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(grant.status, grant.urgent)}
                      <Badge variant="outline" className="text-xs">
                        {grant.category}
                      </Badge>
                    </div>
                  </div>
                  {grant.status === "申請可能" ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{grant.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className={grant.urgent ? "text-destructive font-medium" : ""}>
                      {grant.deadline}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">概要</p>
                  <p className="text-sm">{grant.description}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">申請要件</p>
                  <p className="text-sm">{grant.requirements}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  {grant.applicationUrl && grant.status === "申請可能" ? (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      data-testid={`button-apply-${grant.id}`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      申請手続きへ
                    </Button>
                  ) : grant.status === "申請済み" ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      data-testid={`button-status-${grant.id}`}
                    >
                      申請状況を確認
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="flex-1"
                      disabled
                    >
                      申請期間外
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    data-testid={`button-details-${grant.id}`}
                  >
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 申請サポート */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">申請サポート</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              補助金申請でお困りの場合は、以下のサポートをご利用ください。
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-16"
                data-testid="button-consultation"
              >
                <div className="text-center">
                  <p className="font-medium text-sm">申請相談</p>
                  <p className="text-xs text-muted-foreground">専門家に相談</p>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16"
                data-testid="button-document-help"
              >
                <div className="text-center">
                  <p className="font-medium text-sm">書類作成支援</p>
                  <p className="text-xs text-muted-foreground">申請書類の作成</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}