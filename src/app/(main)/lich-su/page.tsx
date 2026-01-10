import PageHeader from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function LichSuPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch sử"
        description="Xem lại và phân tích dữ liệu cảm biến đã lưu trữ."
      />
       <Card className="min-h-[60vh]">
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-12">
                <BarChart3 className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-foreground">Tính năng đang được phát triển</h3>
                <p>Các biểu đồ và công cụ phân tích lịch sử sẽ sớm được cập nhật.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
