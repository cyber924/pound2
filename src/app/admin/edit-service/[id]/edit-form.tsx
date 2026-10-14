'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, updateDoc, collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Server } from 'lucide-react';
import type { Service, ProjectConfig } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  description: z.string().min(1, '짧은 설명을 입력해주세요.'),
  longDescription: z.string().min(1, '상세 설명을 입력해주세요.'),
  category: z.string().min(1, '카테고리를 입력해주세요.'),
  techStack: z.union([z.string(), z.array(z.string())]),
  imageUrl: z.string().url('유효한 URL을 입력해주세요.'),
  imageHint: z.string(),
  url: z.string().url('유효한 URL을 입력해주세요.'),
  projectConfigId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditServiceForm({ serviceId }: { serviceId: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const configsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projectConfigs') : null),
    [firestore]
  );
  const { data: projectConfigs } = useCollection<ProjectConfig>(configsRef);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        description: '',
        longDescription: '',
        category: '',
        techStack: [],
        imageUrl: '',
        imageHint: '',
        url: '',
        projectConfigId: 'unassigned',
    },
  });

  useEffect(() => {
    if (!firestore) return;
    const fetchServiceData = async () => {
        try {
            const serviceRef = doc(firestore, 'services', serviceId);
            const serviceSnap = await getDoc(serviceRef);
            if (serviceSnap.exists()) {
                const serviceData = serviceSnap.data() as Service;
                form.reset({
                    ...serviceData,
                    techStack: Array.isArray(serviceData.techStack) ? serviceData.techStack.join(', ') : '',
                    projectConfigId: serviceData.projectConfigId || 'unassigned',
                });
            } else {
                toast({
                    title: '오류',
                    description: '서비스를 찾을 수 없습니다.',
                    variant: 'destructive',
                });
                router.push('/admin/edit-service');
            }
        } catch (error) {
            console.error('Error fetching service:', error);
            toast({
                title: '오류',
                description: '서비스 정보를 가져오는 중 오류가 발생했습니다.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchServiceData();
  }, [firestore, serviceId, form, router, toast]);

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;

    const serviceRef = doc(firestore, 'services', serviceId);

    const { techStack, ...restData } = data;
    const techStackArray = typeof techStack === 'string' 
      ? techStack.split(',').map((s) => s.trim()).filter(Boolean) 
      : techStack;
    
    const updateData = {
      ...restData,
      techStack: techStackArray,
      projectConfigId: restData.projectConfigId === 'unassigned' ? null : (restData.projectConfigId || null),
    };
    
    updateDoc(serviceRef, updateData).then(() => {
        toast({
          title: '성공',
          description: '서비스 정보와 연계 인프라 설정이 성공적으로 업데이트되었습니다.',
        });
        router.push('/admin/edit-service');
    }).catch(serverError => {
      console.error("Update failed:", serverError);
      
      const permissionError = new FirestorePermissionError({
        path: serviceRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });

      errorEmitter.emit('permission-error', permissionError);

      toast({
        title: '업데이트 실패',
        description: '데이터 저장 중 오류가 발생했습니다. 권한을 확인하세요.',
        variant: 'destructive',
      });
    });
  };

  if (isLoading) {
    return (
        <Card>
            <CardContent className="pt-6">
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardContent className="pt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>서비스 이름</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                  control={form.control}
                  name="projectConfigId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Server className="h-4 w-4 text-primary" />
                        연계 프로젝트 인프라 (환경설정 매칭)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'unassigned'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="연계할 인프라 환경설정을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">미지정 (독립 서비스)</SelectItem>
                          {projectConfigs?.map((cfg) => (
                            <SelectItem key={cfg.id} value={cfg.id}>
                              {cfg.name} ({cfg.projectId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        이 서비스를 구동하거나 관리할 Firebase 인프라 환경설정을 매칭합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>짧은 설명</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>상세 설명</FormLabel>
                    <FormControl>
                        <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="techStack"
                render={({ field, ...rest }) => (
                    <FormItem>
                    <FormLabel>기술 스택</FormLabel>
                    <FormControl>
                        <Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value} />
                    </FormControl>
                    <FormDescription>
                        쉼표(,)로 각 기술을 구분해주세요. (예: React, Next.js, Firebase)
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>이미지 URL</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="imageHint"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>이미지 힌트</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                     <FormDescription>
                        AI 이미지 검색을 위한 키워드입니다 (최대 2개, 띄어쓰기로 구분).
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>서비스 URL</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                변경사항 저장
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}
