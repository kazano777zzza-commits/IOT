'use client';

import * as React from 'react';
import {
  MoreVertical,
  RefreshCcw,
  Settings,
  Download,
  Power,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SettingsModal } from '../settings-modal';
import StatusBadge from '../shared/status-badge';

export default function Header() {
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    // In a real app, this would trigger a data refetch.
    setLastUpdated(new Date());
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
             <SidebarTrigger />
          </div>
          
          <div className="flex items-center gap-4">
            <Power className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold">
                Giám sát môi trường phòng làm việc
              </h1>
              <p className="text-sm text-muted-foreground">
                Công Ty TNHH Công Nghệ Nam Dương
              </p>
            </div>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="hidden items-center gap-4 md:flex">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Wifi size={16} className="text-green-500" />
                 <span>Mạnh</span>
               </div>
               <StatusBadge status="Tốt" iconOnly={false}>Trực tuyến</StatusBadge>
               <p className="text-sm text-muted-foreground">
                  Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
               </p>
               <Separator orientation="vertical" className="h-6" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Wifi size={16} className="text-green-500" />
                         <span>WiFi: Mạnh</span>
                       </div>
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                       <div className="flex items-center gap-2 text-sm">
                         <div className="h-2 w-2 rounded-full bg-green-500"></div>
                         <span>ESP8266: Trực tuyến</span>
                       </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
