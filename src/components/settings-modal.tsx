import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { SENSORS } from '@/lib/data';

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Quản lý ngưỡng cảnh báo, thông báo và giao diện của hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="thresholds" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="thresholds">Ngưỡng cảnh báo</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
            <TabsTrigger value="system">Hệ thống</TabsTrigger>
          </TabsList>
          
          <TabsContent value="thresholds" className="mt-4 max-h-[50vh] overflow-y-auto pr-4">
            <div className="space-y-6">
              {SENSORS.map((sensor) => (
                <div key={sensor.id} className="space-y-4 rounded-lg border p-4">
                  <h4 className="font-medium">{sensor.name}</h4>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Tốt {'<'} {sensor.thresholds.medium}</Label>
                    <div className="col-span-2 flex items-center gap-2">
                       <div className="w-full h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor={`${sensor.id}-medium`}>Trung bình (vàng)</Label>
                    <Input id={`${sensor.id}-medium`} type="number" defaultValue={sensor.thresholds.medium} className="col-span-1" />
                  </div>
                   <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor={`${sensor.id}-high`}>Nguy hiểm (đỏ) {'>='}</Label>
                    <Input id={`${sensor.id}-high`} type="number" defaultValue={sensor.thresholds.high} className="col-span-1" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
             <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Popup cảnh báo</Label>
                  <p className="text-sm text-muted-foreground">Hiển thị popup trên màn hình khi có cảnh báo nguy hiểm.</p>
                </div>
                <Switch defaultChecked/>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Âm thanh cảnh báo</Label>
                  <p className="text-sm text-muted-foreground">Phát âm thanh khi có cảnh báo mới.</p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-4">
             <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Chế độ tối</Label>
                  <p className="text-sm text-muted-foreground">Bật/tắt giao diện nền tối.</p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-4">
            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Nguồn dữ liệu:</span>
                    <span>Firebase</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Thiết bị:</span>
                    <span className="font-mono">ESP8266-NAMDUONG-01</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Phiên bản Dashboard:</span>
                    <span>1.0.0</span>
                </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
