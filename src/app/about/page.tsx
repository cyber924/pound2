'use client';

import {
  Briefcase,
  Cpu,
  Layers3,
  Network,
  Puzzle,
  Rocket,
  Wrench,
  Zap,
  Building,
  Users,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

const InfoCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4">
    <Icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
);

const techStack = [
  { name: 'Next.js 15', category: 'Frontend' },
  { name: 'React Server Components', category: 'Frontend' },
  { name: 'Tailwind + shadcn/ui', category: 'Frontend' },
  { name: 'Firebase', category: 'Backend' },
  { name: 'Edge Functions', category: 'Backend' },
  { name: 'OpenAI GPT-4o', category: 'AI Engine' },
  { name: 'Claude 3', category: 'AI Engine' },
  { name: 'Gemini 1.5 Pro', category: 'AI Engine' },
  { name: 'Vercel Edge', category: 'Infra' },
  { name: 'CDN Cache', category: 'Infra' },
  { name: 'Supabase Log Layer', category: 'Infra' },
];

const useCases = [
    { area: '🔹 문서 자동화', content: 'AI가 보고서, 제안서, 계약서를 자동 생성' },
    { area: '🔹 전자상거래', content: '스마트스토어 상품 상세페이지 자동 제작' },
    { area: '🔹 마케팅', content: '블로그·SNS 콘텐츠 AI 생성 및 배포' },
    { area: '🔹 내부시스템 연동', content: 'ERP / Notion / Google Sheets와 실시간 동기화' },
]

export default function AboutPage() {
  const partnerNames = [
    'Vercel',
    'Firebase',
    'Google Cloud',
    'Next.js',
    'Genkit',
    'Shadcn UI',
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const [heroBgOpacity, setHeroBgOpacity] = useState(0.3);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        const heroHeight = heroRef.current.offsetHeight;
        const newOpacity = Math.max(
          0.1,
          0.3 - (scrollPosition / heroHeight) * 0.2
        );
        setHeroBgOpacity(newOpacity);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative text-center py-20 md:py-32 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <Image
          src="https://picsum.photos/seed/business/1920/1080"
          alt="Business automation background"
          fill
          className="object-cover transition-opacity duration-300"
          style={{ opacity: heroBgOpacity }}
          data-ai-hint="business automation"
          priority
        />
        <div className="absolute inset-0 bg-background/60"></div>
        <div className="relative container mx-auto px-4 z-20">
          <Badge variant="outline" className="mb-4">Pound Automator</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            반복 업무를 자동화하고, 비즈니스 효율을 혁신하는
            <br />
            AI 오케스트레이션 플랫폼
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            데이터, 콘텐츠, 운영을 하나로 연결합니다.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {/* Buttons removed as requested */}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Next.js 15 · Firebase · GPT-4o · Edge Runtime 기반 실시간 자동화 시스템
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section>
        <SectionTitle
          title="서비스 개요 (Service Overview)"
          subtitle="Pound Automator는 AI 기반 비즈니스 자동화 솔루션으로, 반복적인 업무, 문서 생성, 데이터 전송, 보고서 작성 등 기업의 워크플로우를 통합 자동화합니다."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <InfoCard icon={Layers3} title="통합 대시보드" description="단일 대시보드에서 모든 프로세스를 제어하고 모니터링합니다." />
            <InfoCard icon={Rocket} title="지능형 문서 자동화" description="GPT 기반으로 이메일, 보고서 등 다양한 문서를 자동으로 생성합니다." />
            <InfoCard icon={Puzzle} title="유연한 AI 엔진" description="Zapier보다 유연하고, RPA보다 똑똑한 AI 엔진을 경험해보세요." />
        </div>
      </section>

      {/* Tech Stack & System Architecture */}
      <section>
        <SectionTitle
          title="기술 구조 (System Architecture)"
          subtitle="본 서비스는 클라우드 네이티브 환경에서 설계된 AI 오케스트레이션 아키텍처로 구축되었습니다. Edge Functions를 통해 AI 응답이 200ms 이내로 처리됩니다."
        />
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">주요 기술 스택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                    <Badge key={tech.name} variant="secondary" className="text-sm">{tech.name}</Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How We Build */}
      <section>
        <SectionTitle
          title="구축 방법 (How We Build)"
          subtitle="파운드 AI의 모든 프로젝트는 “데이터 → 모델 → 경험” 3단계 프로세스로 구축되며, 코드와 데이터의 완전한 투명성을 보장합니다."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-start gap-3 text-xl"><Network className="text-primary mt-1 flex-shrink-0"/>1. 데이터 수집 및 구조화</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                <ul className="space-y-2 list-disc list-inside">
                    <li>Firestore / Supabase 기반 데이터 모델링</li>
                    <li>클라이언트 API와 자동 동기화</li>
                </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-start gap-3 text-xl"><Cpu className="text-primary mt-1 flex-shrink-0"/>2. AI 모델 연동 및 설계</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                <ul className="space-y-2 list-disc list-inside">
                    <li>GPT/Claude/Gemini 모델별 프롬프트 엔진 설계</li>
                    <li>비즈니스 룰 기반 AI 호출 시퀀스 구성 (AutoPipeline)</li>
                </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-start gap-3 text-xl"><Wrench className="text-primary mt-1 flex-shrink-0"/>3. UI·UX 통합 및 배포</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
                <ul className="space-y-2 list-disc list-inside">
                    <li>Next.js + Vercel 기반 SSR 최적화</li>
                    <li>Edge Function 캐시 및 실시간 모니터링 시스템 구축</li>
                </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <SectionTitle
            title="활용 사례 (Use Cases)"
            subtitle="다양한 산업 분야에서 Pound Automator를 통해 어떻게 업무 효율을 혁신하고 있는지 확인해보세요."
        />
        <div className="max-w-3xl mx-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">구분</TableHead>
                        <TableHead>내용</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {useCases.map(item => (
                        <TableRow key={item.area}>
                            <TableCell className="font-medium">{item.area}</TableCell>
                            <TableCell>{item.content}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </section>

      {/* Pound's Strengths */}
      <section>
        <SectionTitle
          title="파운드의 강점"
          subtitle="우리는 최고의 기술과 비즈니스 통찰력으로 고객과 함께 성장합니다."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <InfoCard
            icon={Zap}
            title="최신 AI 기술력"
            description="최신 생성형 AI 모델과 기술을 발빠르게 적용하여, 가장 효과적인 솔루션을 제공합니다."
          />
          <InfoCard
            icon={Building}
            title="비즈니스 맞춤 솔루션"
            description="단순한 기술 제공을 넘어, 고객의 비즈니스 모델에 최적화된 맞춤형 AI 전략을 설계합니다."
          />
          <InfoCard
            icon={Users}
            title="성공적인 파트너십"
            description="다양한 산업군의 선도 기업들과의 협업을 통해 기술의 실질적인 비즈니스 가치를 증명합니다."
          />
        </div>
      </section>

      {/* Partners Section */}
      <section>
        <SectionTitle
          title="함께하는 파트너"
          subtitle="파운드는 최고의 기업들과 함께 AI 생태계를 만들어가고 있습니다."
        />
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {partnerNames.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
