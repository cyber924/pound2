'use client';

import Image from 'next/image';
import type { Service } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  index?: number;
  onClick: () => void;
}

export function ServiceCard({ service, index, onClick }: ServiceCardProps) {
  return (
    <div onClick={onClick} className="group block cursor-pointer">
      <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
        <CardHeader>
          <div className="aspect-video overflow-hidden rounded-md border mb-4 relative">
            {index !== undefined && (
              <div className="absolute top-3 left-3 z-20 bg-primary/90 backdrop-blur-md text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 font-mono">
                <span>#{index < 10 ? `0${index}` : index}</span>
              </div>
            )}
            <Image
              src={service.imageUrl}
              alt={service.name}
              width={600}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={service.imageHint}
            />
          </div>
          <CardTitle className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-base font-bold">
            {index !== undefined && (
              <span className="text-primary font-mono text-sm font-semibold shrink-0">
                {index < 10 ? `0${index}.` : `${index}.`}
              </span>
            )}
            <span className="truncate" title={service.name}>{service.name}</span>
          </CardTitle>
          <CardDescription className="line-clamp-2">{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2">
            {service.techStack?.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm font-medium text-primary group-hover:text-accent-foreground">
            세부 정보 보기
            <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
