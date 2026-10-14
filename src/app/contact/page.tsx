"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Handshake, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  company: z.string().min(1, "회사명을 입력해주세요."),
  email: z.string().email("유효한 이메일을 입력해주세요."),
  details: z.string().min(10, "문의 내용을 10자 이상 입력해주세요."),
});

type FormData = z.infer<typeof formSchema>;
type InquiryType = "development" | "investment";

function ContactForm({ type }: { type: InquiryType }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      details: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;

    try {
      await addDoc(collection(firestore, "inquiries"), {
        ...data,
        type: type,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "제출 완료",
        description: "문의 내용이 성공적으로 접수되었습니다.",
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "오류",
        description: "문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {type === "development" ? "개발 의뢰" : "제휴 및 투자문의"}
            </CardTitle>
            <CardDescription>
              {type === "development"
                ? "AI 기반 서비스 개발, 아이디어 실현에 대해 문의해주세요."
                : "파운드의 비전과 성장에 함께할 파트너 및 투자자를 기다립니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>회사/기관명</FormLabel>
                    <FormControl>
                      <Input placeholder="주식회사 파운드" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hello@pound.com" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문의 내용</FormLabel>
                    <FormControl>
                      <Textarea placeholder="문의하실 내용을 자세히 설명해주세요." rows={6} {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "development" ? "개발 의뢰 제출" : "제휴 및 투자문의 제출"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}


export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          문의하기
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          파운드와 함께할 새로운 기회를 찾고 있습니다.
        </p>
      </div>

      <Tabs defaultValue="development" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="development">
            <Briefcase className="mr-2 h-4 w-4" />
            개발 의뢰
          </TabsTrigger>
          <TabsTrigger value="investment">
            <Handshake className="mr-2 h-4 w-4" />
            제휴 및 투자문의
          </TabsTrigger>
        </TabsList>
        <TabsContent value="development">
          <ContactForm type="development" />
        </TabsContent>
        <TabsContent value="investment">
          <ContactForm type="investment" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
