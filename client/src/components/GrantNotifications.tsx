import { Bell, ExternalLink, Calendar, DollarSign, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Grant {
  id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string;
  status: 'new' | 'recommended' | 'applied' | 'expired';
  urgency: 'high' | 'medium' | 'low';
}

export default function GrantNotifications() {
  // todo: remove mock functionality - mock grant data
  const [grants] = useState<Grant[]>([
    {
      id: '1',
      title: '漁業経営安定化支援補助金',
      description: '燃料費高騰に対する経営安定化を目的とした補助金制度です。',
      amount: '最大50万円',
      deadline: '2024-10-31',
      eligibility: '個人漁業者、年間売上300万円以上',
      status: 'recommended',
      urgency: 'high'
    },
    {
      id: '2',
      title: '漁船設備更新支援事業',
      description: '漁船の安全設備や効率化設備の更新・導入を支援します。',
      amount: '最大200万円',
      deadline: '2024-11-15',
      eligibility: '登録漁業者、5年以上の操業実績',
      status: 'new',
      urgency: 'medium'
    },
    {
      id: '3',
      title: 'スマート漁業推進補助金',
      description: 'IoT機器やAIシステム導入による漁業のデジタル化を支援。',
      amount: '最大100万円',
      deadline: '2024-12-20',
      eligibility: '組合員、革新的技術導入計画有り',
      status: 'new',
      urgency: 'low'
    },
    {
      id: '4',
      title: '漁業後継者育成支援金',
      description: '次世代漁業者の育成・技能向上を目的とした支援制度です。',
      amount: '最大30万円',
      deadline: '2024-09-30',
      eligibility: '40歳以下、後継者認定',
      status: 'expired',
      urgency: 'high'
    }
  ]);

  const handleApplyGrant = (grantId: string) => {
    console.log("補助金申請開始:", grantId);
    // todo: remove mock functionality - implement grant application
    alert("申請書類の自動入力画面に移動します");
  };

  const handleViewDetails = (grantId: string) => {
    console.log("補助金詳細表示:", grantId);
    // todo: remove mock functionality - implement grant details view
  };

  const getStatusInfo = (status: Grant['status']) => {
    switch (status) {
      case 'new':
        return { label: '新着', variant: 'default' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'recommended':
        return { label: 'おすすめ', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'applied':
        return { label: '申請済み', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
      case 'expired':
        return { label: '期限切れ', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    }
  };

  const getUrgencyColor = (urgency: Grant['urgency']) => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'low': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
    }
  };

  const availableGrants = grants.filter(grant => grant.status !== 'expired');
  const expiredGrants = grants.filter(grant => grant.status === 'expired');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            補助金・助成金情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableGrants.length > 0 ? (
            <div className="space-y-4">
              {availableGrants.map((grant) => {
                const statusInfo = getStatusInfo(grant.status);
                
                return (
                  <div 
                    key={grant.id}
                    className={`p-4 rounded-lg border-2 ${getUrgencyColor(grant.urgency)}`}
                    data-testid={`grant-${grant.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{grant.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{grant.description}</p>
                      </div>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm"><strong>支給額:</strong> {grant.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm"><strong>締切:</strong> {grant.deadline}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileCheck className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span className="text-sm"><strong>対象:</strong> {grant.eligibility}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApplyGrant(grant.id)}
                        disabled={grant.status === 'applied'}
                        data-testid={`button-apply-${grant.id}`}
                        className="flex-1"
                      >
                        {grant.status === 'applied' ? '申請済み' : '申請開始'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDetails(grant.id)}
                        data-testid={`button-details-${grant.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">現在利用可能な補助金はありません</p>
            </div>
          )}
          
          {expiredGrants.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="font-medium text-muted-foreground mb-3">期限切れ</h5>
              <div className="space-y-3">
                {expiredGrants.map((grant) => (
                  <div 
                    key={grant.id}
                    className="p-3 rounded bg-muted/50 opacity-60"
                    data-testid={`expired-grant-${grant.id}`}
                  >
                    <h6 className="font-medium text-sm">{grant.title}</h6>
                    <p className="text-xs text-muted-foreground">
                      締切: {grant.deadline} | {grant.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}