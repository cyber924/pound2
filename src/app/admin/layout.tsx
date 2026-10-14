'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Pencil, Settings, PlusCircle, MessageSquare, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';

const navLinks = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/edit-service', icon: Pencil, label: '사이트 수정' },
  { href: '/admin/settings', icon: Settings, label: '환경설정' },
  { href: '/admin/add-service', icon: PlusCircle, label: '사이트 등록' },
  { href: '/admin/inquiries', icon: MessageSquare, label: '고객 문의' },
];

function AdminNavLinks() {
    const pathname = usePathname();
  return (
    <nav className="grid items-start px-2 text-sm font-medium">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            (pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))) && 'bg-muted text-primary'
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[220px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-6 w-6" />
              <span>관리자 패널</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <AdminNavLinks />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader className='sr-only'>
                      <SheetTitle>Admin Menu</SheetTitle>
                      <SheetDescription>Navigation links for the admin dashboard.</SheetDescription>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium">
                        <Logo />
                        <AdminNavLinks />
                    </nav>
                </SheetContent>
            </Sheet>
            <Logo />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
