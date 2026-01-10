import PageHeader from "@/components/shared/page-header";
import { RawSensorDisplay } from "@/components/raw-sensor-display";

export default function ThoiGianThucPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thời gian thực"
        description="Dữ liệu RAW trực tiếp từ ESP8266 (http://192.168.4.1/data)"
      />
      <RawSensorDisplay />
    </div>
  );
}
