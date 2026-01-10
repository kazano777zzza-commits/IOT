import PageHeader from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive } from "lucide-react";

export default function ThietBiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thiết bị"
        description="Quản lý trạng thái thiết bị, cảm biến và xem nhật ký hệ thống."
      />
       <Card className="min-h-[60vh]">
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-12">
                <HardDrive className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Tính năng đang được phát triển</h3>
                <p>Giao diện quản lý thiết bị và nhật ký hệ thống sẽ sớm được cập nhật.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
