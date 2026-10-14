"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useRef, useState } from "react";
import { Wand2, Loader, Sparkles } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { generateServiceDetailsAction } from "./actions";
import { useForm } from "react-hook-form";
import type { AIServiceDetailsOutput } from "@/ai/flows/ai-service-details-generation";
import { Skeleton } from "@/components/ui/skeleton";

type FormValues = {
  serviceConcept: string;
  serviceName: string;
  serviceDescription: string;
  thumbnailSuggestions: string[];
  techStackSuggestions: string[];
};

const initialState = {
  message: "",
  data: null,
  errors: null,
};

function SubmitButton() {
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
          AI로 생성
        </>
      )}
    </Button>
  );
}

export function NewServiceForm() {
  const [state, formAction] = useActionState(
    generateServiceDetailsAction,
    initialState
  );
  const [generatedData, setGeneratedData] =
    useState<AIServiceDetailsOutput | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      serviceConcept: "",
      serviceName: "",
      serviceDescription: "",
      thumbnailSuggestions: [],
      techStackSuggestions: [],
    },
  });

  useEffect(() => {
    if (state.message === "success" && state.data) {
      setGeneratedData(state.data);
      form.reset({
        ...form.getValues(),
        serviceName: state.data.serviceName,
        serviceDescription: state.data.serviceDescription,
        thumbnailSuggestions: state.data.thumbnailSuggestions,
        techStackSuggestions: state.data.techStackSuggestions,
      });
      toast({
        title: "성공!",
        description: "서비스 세부 정보가 생성되었습니다.",
        variant: "default",
      });
    } else if (state.message && state.message !== "success") {
      toast({
        title: "오류",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, form]);

  const { pending } = useFormStatus();

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            ref={formRef}
            action={formAction}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="serviceConcept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">서비스 컨셉</FormLabel>
                  <FormDescription>
                    새로운 서비스를 몇 문장으로 설명해주세요. 예: "디자이너를 위한 실시간 협업 도구".
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="예: AI 기반 코드 리뷰 어시스턴트"
                      {...field}
                      rows={4}
                      disabled={!!generatedData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!generatedData && <SubmitButton />}

            {(pending || generatedData) && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">생성된 세부 정보</h3>
                </div>

                <FormField
                  control={form.control}
                  name="serviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>서비스 이름</FormLabel>
                      <FormControl>
                        {pending ? <Skeleton className="h-10 w-full" /> : <Input {...field} />}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>서비스 설명</FormLabel>
                      <FormControl>
                        {pending ? <Skeleton className="h-20 w-full" /> : <Textarea {...field} rows={3} />}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>기술 스택 제안</FormLabel>
                  {pending ? (
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-16" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                    {form.getValues("techStackSuggestions").map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel>썸네일 아이디어</FormLabel>
                   {pending ? (
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-2/3" />
                     </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {form.getValues("thumbnailSuggestions").map((idea) => (
                      <li key={idea}>{idea}</li>
                    ))}
                  </ul>
                  )}
                </FormItem>
                
                {generatedData && !pending && (
                  <Button className="w-full">
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
