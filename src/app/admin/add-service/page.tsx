import { AddServiceForm } from "./add-form";

export default function AddServicePage() {
  return (
    <div className="max-w-2xl mx-auto">
       <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI 서비스 등록</h1>
        <p className="text-muted-foreground">
          서비스 컨셉을 입력하면 AI가 나머지 정보를 생성해줍니다.
        </p>
      </div>
      <AddServiceForm />
    </div>
  );
}
