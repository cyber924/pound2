'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Sparkles,
  Zap,
  Flame,
  Shuffle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { collection } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Service } from '@/types';
import { ServiceCard } from '@/components/service-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { DEFAULT_32_SERVICES } from '@/lib/default-services';

const AnimatedCounter = ({
  endValue,
  duration = 2000,
  className,
}: {
  endValue: number;
  duration?: number;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime: number | null = null;
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * endValue));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [endValue, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  );
};

export default function Home() {
  const stats = [
    { value: 10, label: 'AI Services', icon: TrendingUp },
    { value: 50, label: 'Global Partners', icon: Users },
    { value: 99, label: 'Customer Satisfaction', unit: '%', icon: CheckCircle },
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const [heroBgOpacity, setHeroBgOpacity] = useState(0.3);

  const firestore = useFirestore();
  const router = useRouter();

  const servicesRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const { data: rawServices, isLoading } = useCollection<Service>(servicesRef);
  const services = useMemo(() => {
    if (rawServices && rawServices.length > 0) return rawServices;
    return DEFAULT_32_SERVICES as Service[];
  }, [rawServices]);

  // Recommendation configuration
  const [recMode, setRecMode] = useState<'trending' | 'tech' | 'explore'>('trending');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [exploreServices, setExploreServices] = useState<Service[]>([]);

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

  // Exploration services shuffler (runs client side to prevent hydration mismatches)
  useEffect(() => {
    if (services && services.length > 0) {
      setExploreServices([...services].sort(() => Math.random() - 0.5));
    }
  }, [services, shuffleSeed]);

  // Dynamically calculate trending category
  const trendingCategoryInfo = useMemo(() => {
    if (!services || services.length === 0) return { category: 'AI', count: 0 };
    const counts: Record<string, number> = {};
    services.forEach((s) => {
      if (s.category) {
        counts[s.category] = (counts[s.category] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      category: sorted[0]?.[0] || 'AI',
      count: sorted[0]?.[1] || 0,
    };
  }, [services]);

  // Core Recommendation Algorithm logic
  const recommendedServices = useMemo(() => {
    if (!services || services.length === 0) return [];

    let result = [...services];

    if (recMode === 'trending') {
      const topCat = trendingCategoryInfo.category;
      result = services.filter((s) => s.category === topCat);
      if (result.length < 3) {
        const remaining = services.filter((s) => s.category !== topCat);
        result = [...result, ...remaining];
      }
    } else if (recMode === 'tech') {
      // Sort by richness of tech stack
      result.sort((a, b) => (b.techStack?.length || 0) - (a.techStack?.length || 0));
    } else if (recMode === 'explore') {
      // Use explore services that are shuffled on-demand to maintain stability
      return exploreServices.slice(0, 3);
    }

    return result.slice(0, 3);
  }, [services, recMode, trendingCategoryInfo, exploreServices]);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative text-center py-20 md:py-32 lg:py-40 rounded-lg overflow-hidden -mt-8"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        <Image
          src="https://picsum.photos/seed/future/1920/1080"
          alt="Futuristic background"
          fill
          className="object-cover transition-opacity duration-300"
          style={{ opacity: heroBgOpacity }}
          data-ai-hint="futuristic abstract"
          priority
        />
        <div className="absolute inset-0 bg-background/50"></div>
        <div className="relative container mx-auto px-4 z-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-pulse duration-[3000ms]">
            AI, 세상을 다시 만들다.
            <br />
            파운드가 그리는 생성형 AI의 미래.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            파운드는 단순한 AI 서비스가 아닌, 새로운 시대의 패러다임을 제시합니다. 국경 없는 기술력으로 당신의 비즈니스에 무한한 가능성을 더하세요.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg">
              <Link href="/services">서비스 둘러보기</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">기술 및 투자 문의</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-muted/30 border-0">
              <CardContent className="p-6">
                <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground">
                  <AnimatedCounter endValue={stat.value} />
                  {stat.unit}
                </div>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">주요 서비스</h2>
          <p className="mt-2 text-muted-foreground">파운드가 현재 서비스하는 최신 생성형 AI 서비스입니다.</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services?.slice(0, 3).map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                index={index + 1}
                onClick={() => router.push(`/services?search=${service.name}`)} 
              />
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/services">모든 서비스 보기</Link>
          </Button>
        </div>
      </section>

      {/* Recommended Services Section */}
      <section className="container mx-auto px-4 bg-muted/20 py-16 rounded-3xl border border-border/40 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 h-64 w-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <Sparkles className="h-3 w-3 animate-spin duration-3000" />
            AI 오케스트레이션 추천
          </div>
          <h2 className="text-3xl font-bold tracking-tight">개인화 추천 서비스</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            정교한 탐색 알고리즘을 통해 고객님께 가장 적합한 최첨단 AI 솔루션을 제안합니다.
          </p>
        </div>

        {/* Algorithm Selectors */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
          <Button
            variant={recMode === 'trending' ? 'default' : 'outline'}
            onClick={() => setRecMode('trending')}
            className="rounded-full gap-2 transition-all duration-300"
          >
            <Flame className="h-4 w-4 text-orange-500" />
            트렌딩 카테고리 추천
          </Button>
          <Button
            variant={recMode === 'tech' ? 'default' : 'outline'}
            onClick={() => setRecMode('tech')}
            className="rounded-full gap-2 transition-all duration-300"
          >
            <Award className="h-4 w-4 text-blue-500" />
            강력한 멀티스택 중심
          </Button>
          <Button
            variant={recMode === 'explore' ? 'default' : 'outline'}
            onClick={() => setRecMode('explore')}
            className="rounded-full gap-2 transition-all duration-300"
          >
            <Shuffle className="h-4 w-4 text-emerald-500" />
            지능형 무작위 발견
          </Button>
        </div>

        {/* Dynamic Context Card (Explain the Algorithm Recommendation Reason) */}
        <div className="max-w-2xl mx-auto mb-8 bg-card border border-border/60 rounded-2xl p-4 text-center text-sm shadow-sm relative z-10">
          {recMode === 'trending' && (
            <p className="text-muted-foreground">
              🔥 <strong>트렌딩 알고리즘 적용:</strong> 현재 플랫폼에서 가장 활발히 등록 및 확장되고 있는 대세 분야는{' '}
              <span className="text-primary font-semibold underline underline-offset-4">
                '{trendingCategoryInfo.category}' ({trendingCategoryInfo.count}개 서비스)
              </span>{' '}
              입니다. 해당 카테고리의 대표 핵심 솔루션을 엄선하였습니다.
            </p>
          )}
          {recMode === 'tech' && (
            <p className="text-muted-foreground">
              💡 <strong>기술 스택 규모 가중치 알고리즘 적용:</strong> 단순 솔루션을 넘어, 다채로운 최첨단 기술스택이 고도로 융합된 멀티 플랫폼 서비스들을 우선 추천합니다.
            </p>
          )}
          {recMode === 'explore' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <p className="text-muted-foreground">
                🎲 <strong>무작위 발견 알고리즘 적용:</strong> 편향되지 않은 고른 노출과 무한한 비즈니스 기회 창출을 위해 완전히 새로운 실시간 무작위 발견 추천을 수행합니다.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShuffleSeed((prev) => prev + 1)}
                className="gap-1.5 h-8 text-xs font-semibold shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
                새로고침
              </Button>
            </div>
          )}
        </div>

        {/* Recommended Cards Display with motion animation transition */}
        <div className="relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-6 w-3/4 mt-4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendedServices.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {recommendedServices.map((service, idx) => (
                  <motion.div
                    key={`${recMode}-${service.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex flex-col"
                  >
                    <div className="flex-1 flex flex-col group relative">
                      {/* Badge for why it's recommended */}
                      <div className="absolute top-3 right-3 z-30 bg-primary/95 text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {recMode === 'trending' && 'Trending No.1'}
                        {recMode === 'tech' && `Top tech (${service.techStack?.length || 0})`}
                        {recMode === 'explore' && 'New Discovery'}
                      </div>
                      
                      <ServiceCard 
                        service={service} 
                        index={idx + 1}
                        onClick={() => router.push(`/services?search=${service.name}`)} 
                      />
                      
                      {/* Context label under the card */}
                      <div className="mt-2.5 px-3 py-2 bg-card border border-border/30 rounded-xl text-xs text-muted-foreground flex items-start gap-1.5 shadow-sm">
                        <Zap className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                        <span>
                          {recMode === 'trending' && (
                            <>대세 <strong>{service.category}</strong> 카테고리의 대표적 고성능 서비스입니다.</>
                          )}
                          {recMode === 'tech' && (
                            <>무려 <strong>{service.techStack?.length || 0}개</strong>의 핵심 연동 스택 탑재</>
                          )}
                          {recMode === 'explore' && (
                            <>새로운 비즈니스 혁신을 일으킬 최적의 추천 매칭</>
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">현재 추천할 서비스가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
