'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useCollectionCount, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import type { Service, Inquiry } from '@/types';
import { Briefcase, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { DEFAULT_32_SERVICES } from '@/lib/default-services';
import { DEFAULT_3P_CONFIGS } from '@/lib/default-configs';

export default function AdminDashboard() {
  const firestore = useFirestore();

  const recentServicesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'services'), orderBy('name'), limit(5))
        : null,
    [firestore]
  );
  const allServicesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'services') : null),
    [firestore]
  );
  const allInquiriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'inquiries') : null),
    [firestore]
  );
  const allConfigsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projectConfigs') : null),
    [firestore]
  );

  const { data: rawRecentServices, isLoading: isLoadingServices } =
    useCollection<Service>(recentServicesQuery);
  const { count: rawTotalServices, isLoading: isLoadingServicesCount } = 
    useCollectionCount(allServicesQuery);
  const { count: totalInquiries, isLoading: isLoadingInquiriesCount } = 
    useCollectionCount(allInquiriesQuery);
  const { count: rawTotalConfigs, isLoading: isLoadingConfigsCount } = 
    useCollectionCount(allConfigsQuery);

  const totalServices = useMemo(() => {
    if (rawTotalServices && rawTotalServices > 0) return rawTotalServices;
    return DEFAULT_32_SERVICES.length;
  }, [rawTotalServices]);

  const totalConfigs = useMemo(() => {
    if (rawTotalConfigs && rawTotalConfigs > 0) return rawTotalConfigs;
    return DEFAULT_3P_CONFIGS.length;
  }, [rawTotalConfigs]);

  const recentServices = useMemo(() => {
    if (rawRecentServices && rawRecentServices.length > 0) return rawRecentServices;
    return DEFAULT_32_SERVICES.slice(0, 5) as Service[];
  }, [rawRecentServices]);

  const isLoading =
    isLoadingServices || isLoadingServicesCount || isLoadingInquiriesCount;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          서비스 현황을 요약하고 데이터를 관리합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 서비스</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalServices}</div>
            )}
            <p className="text-xs text-muted-foreground">
              현재 등록된 총 서비스 개수
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 고객 문의</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalInquiries}</div>
            )}
            <p className="text-xs text-muted-foreground">
              지금까지 접수된 총 문의 개수
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">환경설정</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingConfigsCount ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalConfigs}</div>
            )}
            <p className="text-xs text-muted-foreground">
              <Link href="/admin/settings" className="hover:underline text-primary">
                연계 프로젝트 인프라 명세 관리 →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 등록된 서비스</CardTitle>
          <CardDescription>
            최근에 추가된 5개의 서비스 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>서비스 이름</TableHead>
                  <TableHead>카테고리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : recentServices && recentServices.length > 0 ? (
                  recentServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      표시할 서비스가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" asChild className="mt-4 w-full">
            <Link href="/admin/edit-service">전체 서비스 관리</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
