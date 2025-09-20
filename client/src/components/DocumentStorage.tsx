import { FileText, Camera, Upload, Eye, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface StoredDocument {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  expiryDate?: string;
  addedDate: string;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  category: string;
  notes?: string;
}

export default function DocumentStorage() {
  // todo: remove mock functionality - mock documents and contacts
  const [documents] = useState<StoredDocument[]>([
    {
      id: '1',
      name: '漁業許可証',
      type: '許可証',
      imageUrl: '/api/placeholder/300/200',
      expiryDate: '2025-03-31',
      addedDate: '2024-08-15'
    },
    {
      id: '2',
      name: '船舶免許',
      type: '免許',
      imageUrl: '/api/placeholder/300/200',
      expiryDate: '2026-12-15',
      addedDate: '2024-08-15'
    },
    {
      id: '3',
      name: '船舶保険証',
      type: '保険',
      imageUrl: '/api/placeholder/300/200',
      expiryDate: '2024-12-31',
      addedDate: '2024-08-15'
    }
  ]);

  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: '篠島漁協',
      phone: '0569-67-2111',
      category: '組合',
      notes: '出荷・販売関連'
    },
    {
      id: '2',
      name: '山田船舶修理',
      phone: '0569-67-3456',
      category: '修理業者',
      notes: 'エンジン・船体修理'
    },
    {
      id: '3',
      name: '海洋資材供給',
      phone: '0569-67-7890',
      category: '資材業者',
      notes: '網・ロープ・燃料'
    },
    {
      id: '4',
      name: '鈴木電機',
      phone: '0569-67-4321',
      category: '電気工事',
      notes: '無線機・電子機器'
    }
  ]);

  const handleAddDocument = () => {
    console.log("新しい書類を追加");
    // todo: remove mock functionality - implement document upload
  };

  const handleViewDocument = (docId: string) => {
    console.log("書類を表示:", docId);
    // todo: remove mock functionality - implement document viewer
  };

  const handleCallContact = (phone: string) => {
    console.log("電話をかける:", phone);
    // todo: remove mock functionality - implement phone call
    window.location.href = `tel:${phone}`;
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', label: '期限切れ', variant: 'destructive' as const };
    if (daysUntilExpiry <= 30) return { status: 'expiring', label: '期限近し', variant: 'destructive' as const };
    if (daysUntilExpiry <= 90) return { status: 'warning', label: '要注意', variant: 'secondary' as const };
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">書類保管</TabsTrigger>
          <TabsTrigger value="contacts">連絡先</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  デジタル書類棚
                </span>
                <Button 
                  onClick={handleAddDocument}
                  data-testid="button-add-document"
                  size="sm"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {documents.map((doc) => {
                  const expiryStatus = getExpiryStatus(doc.expiryDate);
                  
                  return (
                    <div 
                      key={doc.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover-elevate"
                      data-testid={`document-${doc.id}`}
                    >
                      <div className="w-16 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                        <img 
                          src={doc.imageUrl} 
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                        {doc.expiryDate && (
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              期限: {doc.expiryDate}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {expiryStatus && (
                          <Badge variant={expiryStatus.variant} className="text-xs">
                            {expiryStatus.label}
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDocument(doc.id)}
                          data-testid={`button-view-${doc.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {documents.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">まだ書類が保存されていません</p>
                  <Button 
                    onClick={handleAddDocument}
                    className="mt-4"
                    data-testid="button-add-first-document"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    最初の書類を追加
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-6 h-6 text-primary" />
                連絡先メモ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                    data-testid={`contact-${contact.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {contact.category}
                        </Badge>
                        {contact.notes && (
                          <span className="text-xs text-muted-foreground">
                            {contact.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleCallContact(contact.phone)}
                      data-testid={`button-call-${contact.id}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      電話
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}