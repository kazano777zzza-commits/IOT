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
      <DialogContent className="max-w-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Cài đặt</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Quản lý ngưỡng cảnh báo, thông báo và giao diện của hệ thống.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="thresholds" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="thresholds" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">Ngưỡng cảnh báo</TabsTrigger>
            <TabsTrigger value="notifications" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">Thông báo</TabsTrigger>
            <TabsTrigger value="appearance" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">Giao diện</TabsTrigger>
            <TabsTrigger value="system" className="text-slate-700 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">Hệ thống</TabsTrigger>
          </TabsList>
          
          <TabsContent value="thresholds" className="mt-4 max-h-[50vh] overflow-y-auto pr-4">
            <div className="space-y-6">
              {SENSORS.map((sensor) => (
                <div key={sensor.id} className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white">{sensor.name}</h4>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-slate-700 dark:text-slate-300">Tốt {'<'} {sensor.thresholds.medium}</Label>
                    <div className="col-span-2 flex items-center gap-2">
                       <div className="w-full h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor={`${sensor.id}-medium`} className="text-slate-700 dark:text-slate-300">Trung bình (vàng)</Label>
                    <Input id={`${sensor.id}-medium`} type="number" defaultValue={sensor.thresholds.medium} className="col-span-1 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
                  </div>
                   <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor={`${sensor.id}-high`} className="text-slate-700 dark:text-slate-300">Nguy hiểm (đỏ) {'>='}</Label>
                    <Input id={`${sensor.id}-high`} type="number" defaultValue={sensor.thresholds.high} className="col-span-1 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
             <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900 dark:text-white">Popup cảnh báo</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Hiển thị popup trên màn hình khi có cảnh báo nguy hiểm.</p>
                </div>
                <Switch defaultChecked/>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900 dark:text-white">Âm thanh cảnh báo</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phát âm thanh khi có cảnh báo mới.</p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-4">
             <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900 dark:text-white">Chế độ tối</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Bật/tắt giao diện nền tối.</p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-4">
            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Nguồn dữ liệu:</span>
                    <span className="text-slate-900 dark:text-white">Firebase</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">ID Thiết bị:</span>
                    <span className="font-mono text-slate-900 dark:text-white">ESP8266-NAMDUONG-01</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Phiên bản Dashboard:</span>
                    <span className="text-slate-900 dark:text-white">1.0.0</span>
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
