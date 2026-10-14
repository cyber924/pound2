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
import { collection, orderBy, query } from 'firebase/firestore';
import type { Inquiry } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function InquiriesPage() {
  const firestore = useFirestore();

  const inquiriesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'inquiries'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: inquiries, isLoading } = useCollection<Inquiry>(inquiriesQuery);

  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('ko-KR');
    }
    return '날짜 없음';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">고객 문의</h1>
        <p className="text-muted-foreground">
          문의하기를 통해 접수된 모든 문의 내역입니다.
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">날짜</TableHead>
              <TableHead className="w-[120px]">구분</TableHead>
              <TableHead>제목 (문의자 정보)</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full my-2" />
            ))}
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {inquiries.map((inquiry) => (
              <AccordionItem value={inquiry.id} key={inquiry.id}>
                <AccordionTrigger className="px-4 py-0 hover:no-underline">
                  <Table className="w-full">
                    <TableBody>
                      <TableRow className="border-none hover:bg-transparent">
                        <TableCell className="w-[150px] font-medium">
                          {formatDate(inquiry.createdAt)}
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <Badge
                            variant={
                              inquiry.type === 'development'
                                ? 'secondary'
                                : 'default'
                            }
                          >
                            {inquiry.type === 'development'
                              ? '개발 의뢰'
                              : '제휴/투자'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          {`${inquiry.name} (${inquiry.company}, ${inquiry.email})`}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-0 pb-4">
                  <div className="p-4 bg-muted/50 rounded-md border">
                    <p className="whitespace-pre-wrap">{inquiry.details}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  표시할 문의 내역이 없습니다.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
