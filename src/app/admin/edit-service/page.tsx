'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import type { Service, ProjectConfig } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, Settings, Server } from 'lucide-react';
import Link from 'next/link';

export default function EditServicePage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const servicesRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const { data: services, isLoading } = useCollection<Service>(servicesRef);

  const configsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projectConfigs') : null),
    [firestore]
  );
  const { data: projectConfigs } = useCollection<ProjectConfig>(configsRef);

  const configMap = useMemoFirebase(() => {
    const map = new Map<string, ProjectConfig>();
    if (projectConfigs) {
      projectConfigs.forEach((cfg) => {
        map.set(cfg.id, cfg);
      });
    }
    return map;
  }, [projectConfigs]);

  const handleDelete = async (serviceId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'services', serviceId));
      toast({
        title: '성공',
        description: '서비스가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Error deleting document: ', error);
      toast({
        title: '오류',
        description: '서비스 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">사이트 수정</h1>
            <Button variant="outline" size="sm" asChild className="gap-1.5 h-8">
              <Link href="/admin/settings">
                <Settings className="h-3.5 w-3.5" />
                환경설정
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            등록된 서비스를 수정하거나 삭제하고 인프라 설정을 매칭합니다.
          </p>
        </div>
        <Button variant="default" asChild className="gap-2">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" />
            프로젝트 환경설정 관리
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>서비스 이름</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>연계 인프라 (환경설정)</TableHead>
              <TableHead className="w-[120px] text-center">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell className="space-x-2 text-center">
                    <Skeleton className="h-8 w-8 inline-block" />
                    <Skeleton className="h-8 w-8 inline-block" />
                  </TableCell>
                </TableRow>
              ))
            ) : services && services.length > 0 ? (
              services.map((service) => {
                const matchedConfig = service.projectConfigId ? configMap.get(service.projectConfigId) : null;
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>
                      {matchedConfig ? (
                        <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-mono text-xs bg-primary/5 text-primary border-primary/20">
                          <Server className="h-3 w-3" />
                          {matchedConfig.name || matchedConfig.projectId}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          미지정 (독립)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-center">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/edit-service/${service.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 작업은 되돌릴 수 없습니다. '{service.name}' 서비스를 영구적으로 삭제합니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(service.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  표시할 서비스가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
