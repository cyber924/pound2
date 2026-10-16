'use client';

import { Search, ExternalLink } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceCard } from '@/components/service-card';
import type { Service } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';


import { DEFAULT_32_SERVICES } from '@/lib/default-services';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const tech = searchParams.get('tech') || 'all';
  const firestore = useFirestore();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const servicesRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const { data: rawServices, isLoading: isLoadingServices } =
    useCollection<Service>(servicesRef);

  const allServices = useMemo(() => {
    if (rawServices && rawServices.length > 0) return rawServices;
    return DEFAULT_32_SERVICES as Service[];
  }, [rawServices]);

  useEffect(() => {
    // If a search term is in the URL, try to find and open the corresponding service modal.
    const searchName = searchParams.get('search');
    if (searchName && allServices) {
      const serviceToOpen = allServices.find(s => s.name === searchName);
      if (serviceToOpen) {
        handleCardClick(serviceToOpen);
      }
    }
  }, [searchParams, allServices]);

  const services = useMemo(() => {
    if (!allServices) return [];
    return allServices.filter((service: Service) => {
      const searchMatch =
        (service.name && service.name.toLowerCase().includes(search.toLowerCase())) ||
        (service.description && service.description.toLowerCase().includes(search.toLowerCase()));
      const categoryMatch = category === 'all' || service.category === category;
      const techMatch =
        tech === 'all' || (service.techStack && service.techStack.includes(tech));
      return searchMatch && categoryMatch && techMatch;
    });
  }, [allServices, search, category, tech]);

  const categories = useMemo(() => {
    if (!allServices) return ['all'];
    const validCategories = allServices.map((s) => s.category).filter(Boolean);
    return ['all', ...Array.from(new Set(validCategories))];
  }, [allServices]);

  const techs = useMemo(() => {
    if (!allServices) return ['all'];
    const validTechs = allServices.flatMap((s) => s.techStack || []).filter(Boolean);
    return [
      'all',
      ...Array.from(new Set(validTechs)),
    ];
  }, [allServices]);

  const handleCardClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };
  
  return (
    <div id="services" className="space-y-8 scroll-mt-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            파운드 서비스
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            파운드는 AI 기술로 창작, 업무, 상거래, 협업을 하나의 생태계로 통합합니다.<br />
            자동화·생성·분석·연결을 아우르는 풀스택 AI 서비스 허브입니다.<br />
            창작부터 자동화까지, 파운드는 모든 AI 서비스를 하나로 엮습니다.
          </p>
        </div>
      </div>

      <form className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="search"
            placeholder="서비스 검색..."
            className="pl-10"
            defaultValue={search}
          />
        </div>
        <Select name="category" defaultValue={category}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리별로 필터링" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? '모든 카테고리' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="tech" defaultValue={tech}>
          <SelectTrigger>
            <SelectValue placeholder="기술별로 필터링" />
          </SelectTrigger>
          <SelectContent>
            {techs.map((t) => (
              <SelectItem key={t} value={t}>
                {t === 'all' ? '모든 기술' : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full sm:col-span-2 md:col-span-4">
          필터 적용
        </Button>
      </form>

      {isLoadingServices ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="aspect-video w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
                 <div className="flex flex-wrap gap-2 mt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-5 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index + 1} onClick={() => handleCardClick(service)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">서비스를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mt-2">
            검색 또는 필터 기준을 조정해 보세요.
          </p>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                 <Badge className="w-fit">{selectedService.category}</Badge>
                 <DialogTitle className="text-3xl md:text-4xl font-bold mt-2">{selectedService.name}</DialogTitle>
                 <DialogDescription className="mt-4 text-lg">
                    {selectedService.description}
                 </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 py-4">
                <div>
                  <div className="aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={selectedService.imageUrl}
                      alt={selectedService.name}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full"
                      data-ai-hint={selectedService.imageHint}
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.techStack?.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">서비스에 대하여</h2>
                    <p className="text-muted-foreground">{selectedService.longDescription}</p>
                  </div>

                  {selectedService.url && (
                    <Button asChild size="lg">
                      <a href={selectedService.url} target="_blank" rel="noopener noreferrer">
                        서비스로 이동 <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
