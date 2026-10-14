import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container py-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Logo />
            <p>&copy; {new Date().getFullYear()} Pound Inc. 모든 권리 보유.</p>
          </div>
          <div className="space-y-1 text-left md:text-right">
            <p>
              <span className="font-semibold">회사명:</span> 파운드 (Pound Inc.)
            </p>
            <p>
              <span className="font-semibold">대표:</span> 윤지윤
            </p>
            <p>
              <span className="font-semibold">주소:</span> 대한민국 서울특별시 강남구 테헤란로 123
            </p>
            <p>
              <span className="font-semibold">전화:</span> 02-1234-5678 |{" "}
              <span className="font-semibold">이메일:</span> contact@pound.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
