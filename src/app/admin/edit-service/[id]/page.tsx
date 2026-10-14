import { EditServiceForm } from './edit-form';

export default async function EditServiceItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
       <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">서비스 수정</h1>
        <p className="text-muted-foreground">
          서비스의 상세 정보를 수정합니다.
        </p>
      </div>
      <EditServiceForm serviceId={id} />
    </div>
  );
}
