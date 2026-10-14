import { Blocks } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Blocks className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold text-foreground">파운드 허브</span>
    </Link>
  );
}
