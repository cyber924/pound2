"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { Menu, User as UserIcon, LogOut } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { useAuth, useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isAdmin = user?.email === 'cyber924@naver.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/about">서비스 소개</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/services">서비스 목록</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/contact">문의하기</Link>
            </Button>
            {isAdmin && (
              <Button variant="ghost" asChild>
                <Link href="/admin">관리자</Link>
              </Button>
            )}
          </nav>

          {isUserLoading ? (
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>
                      {user.displayName ? getInitials(user.displayName) : <UserIcon className="h-5 w-5"/>}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || '사용자'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">가입하기</Link>
              </Button>
            </div>
          )}
          
          <ThemeToggle />

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="sr-only">메인 메뉴</SheetTitle>
                  <SheetDescription className="sr-only">사이트의 주요 페이지로 이동하는 링크들입니다.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <Logo />
                  <nav className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Link href="/about" className={buttonVariants({ variant: "ghost" })}>서비스 소개</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/services" className={buttonVariants({ variant: "ghost" })}>서비스 목록</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>문의하기</Link>
                    </SheetClose>
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>관리자</Link>
                      </SheetClose>
                    )}
                  </nav>
                  {!user && !isUserLoading && (
                    <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                       <SheetClose asChild>
                        <Button variant="ghost" asChild>
                          <Link href="/login">로그인</Link>
                        </Button>
                       </SheetClose>
                       <SheetClose asChild>
                        <Button asChild>
                          <Link href="/signup">가입하기</Link>
                        </Button>
                       </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
