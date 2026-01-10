import PageHeader from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor } from "lucide-react";

export default function ThoiGianThucPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thời gian thực"
        description="Theo dõi trực tiếp các thông số môi trường."
      />
      <Card className="min-h-[60vh]">
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-12">
                <Monitor className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Tính năng đang được phát triển</h3>
                <p>Giao diện giám sát thời gian thực sẽ sớm được cập nhật.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
