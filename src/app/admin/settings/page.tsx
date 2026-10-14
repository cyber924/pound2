'use client';

import { useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ProjectConfig } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Server,
  KeyRound,
  FileCode2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// Pre-seeded default configuration requested by the user
const INITIAL_DEFAULT_CONFIG: Omit<ProjectConfig, 'createdAt' | 'updatedAt'> = {
  id: 'studio-8794506415-b7407',
  name: '파운드 스튜디오 B7407 프로젝트',
  description: '파운드 연계 서비스 및 확장 인프라 구성 명세',
  apiKey: 'AIzaSyBsQtJ7H2TJVhQRK69crhFAU9EnMAo9zS4',
  authDomain: 'studio-8794506415-b7407.firebaseapp.com',
  projectId: 'studio-8794506415-b7407',
  storageBucket: 'studio-8794506415-b7407.firebasestorage.app',
  messagingSenderId: '340716150381',
  appId: '1:340716150381:web:1b1234b6dd49eaba10e964',
};

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const configsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projectConfigs') : null),
    [firestore]
  );
  const { data: configs, isLoading } = useCollection<ProjectConfig>(configsRef);

  // States
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal states for Create / Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<ProjectConfig> | null>(null);

  const toggleShowSecret = (fieldId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast({
      title: '복사 완료',
      description: `${label} 값이 클립보드에 복사되었습니다.`,
    });
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleOpenAddDialog = () => {
    setEditingConfig({
      id: `project-${Date.now()}`,
      name: '',
      description: '',
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (config: ProjectConfig) => {
    setEditingConfig({ ...config });
    setIsDialogOpen(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !editingConfig) return;

    if (!editingConfig.apiKey || !editingConfig.projectId) {
      toast({
        title: '입력 오류',
        description: '프로젝트 ID와 API Key는 필수 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    const docId = editingConfig.id?.trim() || editingConfig.projectId?.trim() || `project-${Date.now()}`;
    const payload = {
      ...editingConfig,
      id: docId,
      name: editingConfig.name || editingConfig.projectId || '프로젝트',
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(firestore, 'projectConfigs', docId), payload, { merge: true });
      toast({
        title: '저장 완료',
        description: `'${payload.name}' 프로젝트 설정이 성공적으로 저장되었습니다.`,
      });
      setIsDialogOpen(false);
      setEditingConfig(null);
    } catch (error) {
      console.error('Error saving project config:', error);
      toast({
        title: '오류 발생',
        description: '설정을 저장하는 도중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfig = async (id: string, name: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'projectConfigs', id));
      toast({
        title: '삭제 완료',
        description: `'${name}' 설정이 삭제되었습니다.`,
      });
    } catch (error) {
      console.error('Error deleting project config:', error);
      toast({
        title: '삭제 실패',
        description: '설정 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSeedDefaultConfig = async () => {
    if (!firestore) return;
    try {
      await setDoc(
        doc(firestore, 'projectConfigs', INITIAL_DEFAULT_CONFIG.id),
        {
          ...INITIAL_DEFAULT_CONFIG,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      toast({
        title: '등록 완료',
        description: '스튜디오 B7407 기본 프로젝트 설정이 성공적으로 등록되었습니다.',
      });
    } catch (error) {
      console.error('Error seeding default config:', error);
      toast({
        title: '오류 발생',
        description: '기본 설정 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const displayList = configs && configs.length > 0 ? configs : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">프로젝트 환경설정</h1>
            <Badge variant="secondary" className="gap-1 font-mono text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              관리자 전용
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            각 연계 프로젝트의 중요 인프라 정보(apiKey, authDomain, projectId 등)를 안전하게 등록하고 열람·수정합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/edit-service">사이트 수정으로 돌아가기</Link>
          </Button>
          <Button onClick={handleOpenAddDialog} className="gap-1.5">
            <Plus className="h-4 w-4" />
            새 환경설정 등록
          </Button>
        </div>
      </div>

      {/* Security & Architecture Guidance Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Server className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="text-foreground font-semibold">
              프로젝트 인프라 명세 보관소 안내
            </strong>
            <p className="text-muted-foreground mt-0.5">
              본 페이지는 관리자 전용 인프라 카탈로그로, 여러 클라이언트 및 연동 프로젝트의 설정값을 조회·기록하기 위한 공간입니다. 현재 앱의 런타임 클라이언트 연결 자체는 안전하게 고정되어 유지됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Empty State / Pre-seed prompt */}
      {!isLoading && displayList.length === 0 && (
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <FileCode2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>등록된 프로젝트 환경설정이 없습니다</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              요청하신 <strong>스튜디오 B7407</strong> 중요 환경설정값으로 첫 프로젝트를 등록하거나 새 프로젝트를 추가하세요.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3 pt-2">
            <Button onClick={handleSeedDefaultConfig} className="gap-2">
              <KeyRound className="h-4 w-4" />
              스튜디오 B7407 기본값 원클릭 등록
            </Button>
            <Button variant="outline" onClick={handleOpenAddDialog}>
              직접 새 프로젝트 입력
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Skeleton Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Config Cards List */}
      <div className="space-y-6">
        {displayList.map((config) => {
          const isApiKeyVisible = !!showSecrets[`${config.id}-apiKey`];
          const isAppIdVisible = !!showSecrets[`${config.id}-appId`];

          return (
            <Card key={config.id} className="relative overflow-hidden shadow-sm">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold">{config.name || config.id}</CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        {config.projectId}
                      </Badge>
                    </div>
                    {config.description && (
                      <CardDescription className="mt-1">{config.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(config)}
                      className="gap-1.5 h-8"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      수정
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-1.5 h-8">
                          <Trash2 className="h-3.5 w-3.5" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>설정을 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            '{config.name || config.id}' 프로젝트의 환경설정 기록을 영구적으로 삭제합니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteConfig(config.id, config.name)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project ID */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Project ID
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(config.projectId, 'projectId')}
                      >
                        {copiedKey === 'projectId' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {config.projectId}
                    </p>
                  </div>

                  {/* Auth Domain */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Auth Domain
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(config.authDomain, 'authDomain')}
                      >
                        {copiedKey === 'authDomain' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {config.authDomain}
                    </p>
                  </div>

                  {/* Storage Bucket */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Storage Bucket
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(config.storageBucket, 'storageBucket')}
                      >
                        {copiedKey === 'storageBucket' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {config.storageBucket}
                    </p>
                  </div>

                  {/* Messaging Sender ID */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Messaging Sender ID
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(config.messagingSenderId, 'messagingSenderId')}
                      >
                        {copiedKey === 'messagingSenderId' ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {config.messagingSenderId}
                    </p>
                  </div>

                  {/* API Key (With Masking) */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          API Key
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          보안 보호
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleShowSecret(`${config.id}-apiKey`)}
                        >
                          {isApiKeyVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(config.apiKey, 'apiKey')}
                        >
                          {copiedKey === 'apiKey' ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {isApiKeyVisible
                        ? config.apiKey
                        : config.apiKey
                        ? `${config.apiKey.slice(0, 10)}••••••••••••••••••••••••`
                        : '(설정되지 않음)'}
                    </p>
                  </div>

                  {/* App ID (With Masking) */}
                  <div className="p-3 rounded-lg border bg-background/50 space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        App ID
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleShowSecret(`${config.id}-appId`)}
                        >
                          {isAppIdVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(config.appId, 'appId')}
                        >
                          {copiedKey === 'appId' ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-sm font-medium truncate select-all">
                      {isAppIdVisible
                        ? config.appId
                        : config.appId
                        ? `${config.appId.slice(0, 15)}••••••••••••••••••••`
                        : '(설정되지 않음)'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig?.name ? `${editingConfig.name} 수정` : '새 프로젝트 환경설정 등록'}
            </DialogTitle>
            <DialogDescription>
              프로젝트의 Firebase 구성 명세 정보를 입력하거나 업데이트합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveConfig} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="projectName">프로젝트 이름</Label>
                <Input
                  id="projectName"
                  placeholder="예: 파운드 스튜디오 B7407"
                  value={editingConfig?.name || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  placeholder="studio-8794506415-b7407"
                  value={editingConfig?.projectId || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, projectId: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">프로젝트 설명 (선택)</Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="해당 프로젝트의 용도 및 메모"
                value={editingConfig?.description || ''}
                onChange={(e) =>
                  setEditingConfig((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="AIzaSyBsQtJ7H2TJVhQRK69crhFAU9EnMAo9zS4"
                value={editingConfig?.apiKey || ''}
                onChange={(e) =>
                  setEditingConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="authDomain">Auth Domain</Label>
                <Input
                  id="authDomain"
                  placeholder="studio-8794506415-b7407.firebaseapp.com"
                  value={editingConfig?.authDomain || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, authDomain: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storageBucket">Storage Bucket</Label>
                <Input
                  id="storageBucket"
                  placeholder="studio-8794506415-b7407.firebasestorage.app"
                  value={editingConfig?.storageBucket || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, storageBucket: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                <Input
                  id="messagingSenderId"
                  placeholder="340716150381"
                  value={editingConfig?.messagingSenderId || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, messagingSenderId: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appId">App ID</Label>
                <Input
                  id="appId"
                  placeholder="1:340716150381:web:1b1234b6dd49eaba10e964"
                  value={editingConfig?.appId || ''}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({ ...prev, appId: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit">저장하기</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
