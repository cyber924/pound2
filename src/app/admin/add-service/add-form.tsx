'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Wand2, Loader, Sparkles, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generateServiceDetailsAction } from './actions';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Server } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProjectConfig } from '@/types';

const generatedDetailsSchema = z.object({
  serviceName: z.string().min(1, '서비스 이름을 입력해주세요.'),
  serviceDescription: z.string().min(1, '서비스 설명을 입력해주세요.'),
  longDescription: z.string().min(1, '상세 설명을 입력해주세요.'),
  category: z.string().min(1, '카테고리를 입력해주세요.'),
  techStack: z.string(),
  imageUrl: z.string().url('유효한 이미지 URL을 입력해주세요.'),
  imageHint: z.string(),
  url: z.string().url('유효한 서비스 URL을 입력해주세요.'),
  projectConfigId: z.string().optional(),
});

const formSchema = z
  .object({
    serviceConcept: z
      .string()
      .min(10, { message: '더 자세한 컨셉을 입력해주세요 (최소 10자).' }),
  })
  .merge(generatedDetailsSchema.partial()); // Make generated fields optional initially

type FormData = z.infer<typeof formSchema>;

const initialState = {
  message: '',
  data: null,
  errors: null,
};

function AIGenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          AI로 세부정보 생성
        </>
      )}
    </Button>
  );
}

export function AddServiceForm() {
  const [state, formAction] = useActionState(
    generateServiceDetailsAction,
    initialState
  );
  const [isGenerated, setIsGenerated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const configsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projectConfigs') : null),
    [firestore]
  );
  const { data: projectConfigs } = useCollection<ProjectConfig>(configsRef);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceConcept: '',
      serviceName: '',
      serviceDescription: '',
      longDescription: '',
      category: '',
      techStack: '',
      imageUrl: '',
      imageHint: '',
      url: '',
      projectConfigId: 'unassigned',
    },
  });

  const {
    formState: { isSubmitting },
    trigger,
  } = form;
  const { pending: isAIGenerating } = useFormStatus();

  useEffect(() => {
    if (state.message === 'success' && state.data) {
      setIsGenerated(true);
      const techStackString = Array.isArray(state.data.techStackSuggestions)
        ? state.data.techStackSuggestions.join(', ')
        : '';
      form.reset({
        ...form.getValues(),
        serviceName: state.data.serviceName,
        serviceDescription: state.data.serviceDescription,
        longDescription: `${state.data.serviceDescription} 이 서비스는 ${techStackString} 등의 최신 기술을 활용하여 구현되었습니다.`,
        category: 'AI',
        techStack: techStackString,
        imageUrl: `https://picsum.photos/seed/${state.data.serviceName
          .toLowerCase()
          .replace(/ /g, '-')}/600/400`,
        imageHint:
          state.data.thumbnailSuggestions?.[0] || 'abstract technology',
        url: 'https://example.com',
      });
      toast({
        title: '성공!',
        description:
          '서비스 세부 정보가 AI로 생성되었습니다. 내용을 검토하고 저장하세요.',
      });
    } else if (state.message && state.message !== 'success') {
      toast({
        title: '오류',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, form]);

  const onSaveSubmit = async (data: FormData) => {
    if (!firestore) return;

    // Ensure all generated fields are validated before submission
    const finalValidation = await trigger(
      Object.keys(generatedDetailsSchema.shape)
    );
    if (!finalValidation) {
      toast({
        title: '유효성 검사 오류',
        description: '모든 필수 필드를 올바르게 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    const { serviceConcept, techStack, serviceName, serviceDescription, ...restOfData } = data;

    const techStackArray = typeof techStack === 'string' 
      ? techStack.split(',').map((s) => s.trim()).filter(Boolean) 
      : [];

    const finalServiceData = {
      name: serviceName,
      description: serviceDescription,
      ...restOfData,
      techStack: techStackArray,
      projectConfigId: restOfData.projectConfigId === 'unassigned' ? null : (restOfData.projectConfigId || null),
    };
    
    const servicesCollectionRef = collection(firestore, 'services');

    addDoc(servicesCollectionRef, finalServiceData)
      .then((docRef) => {
        toast({
          title: '성공',
          description: '새로운 서비스가 성공적으로 등록되었습니다.',
        });
        // Optionally update the new document with its own ID
        // updateDoc(docRef, { id: docRef.id });
        router.push('/admin/edit-service');
      })
      .catch((error) => {
        console.error('Error adding document: ', error);

        const permissionError = new FirestorePermissionError({
          path: servicesCollectionRef.path,
          operation: 'create',
          requestResourceData: finalServiceData,
        });

        errorEmitter.emit('permission-error', permissionError);

        toast({
          title: '등록 실패',
          description: '데이터 저장 중 오류가 발생했습니다. 권한을 확인하세요.',
          variant: 'destructive',
        });
      });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isGenerated) {
      // AI generation is handled by formAction
      return;
    }
    // Final submission is handled by react-hook-form's handleSubmit
    e.preventDefault();
    form.handleSubmit(onSaveSubmit)();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            ref={formRef}
            action={formAction}
            onSubmit={handleFormSubmit}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="serviceConcept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">서비스 컨셉</FormLabel>
                  <FormDescription>
                    등록할 새로운 서비스를 몇 문장으로 설명해주세요. AI가 나머지
                    정보를 생성합니다.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="예: AI 기반 실시간 코드 리뷰 및 자동 리팩토링 제안 도구"
                      {...field}
                      rows={4}
                      disabled={isGenerated || isAIGenerating}
                    />
                  </FormControl>
                  <FormMessage>
                    {state.errors?.serviceConcept?.[0]}
                  </FormMessage>
                </FormItem>
              )}
            />

            {!isGenerated && !isAIGenerating && <AIGenerateButton />}

            {(isAIGenerating || isGenerated) && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="text-xl font-semibold">
                    생성된 세부 정보 (수정 가능)
                  </h3>
                </div>

                {isAIGenerating ? (
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
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="serviceName"
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
                            이 서비스를 구동할 Firebase 인프라 환경설정을 매칭합니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serviceDescription"
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>기술 스택</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            쉼표(,)로 구분해주세요.
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
                            AI 이미지 검색 키워드입니다.
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
                  </>
                )}

                {isGenerated && (
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="mr-2 h-4 w-4" />
                    )}
                    서비스 저장
                  </Button>
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
