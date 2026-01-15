'use client';

import * as React from 'react';
import {
  MoreVertical,
  RefreshCcw,
  Settings,
  Download,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SettingsModal } from '../settings-modal';
import StatusBadge from '../shared/status-badge';
import { ThemeToggle } from '@/providers/theme-provider';

export default function Header() {
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left side - Status info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">{isOnline ? 'Mạnh' : 'Mất kết nối'}</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <StatusBadge status="Tốt" iconOnly={false}>Trực tuyến</StatusBadge>
          </div>

          {/* Center - Last updated */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full transition-colors">
            <Clock size={14} />
            <span>Cập nhật: <span className="font-medium text-slate-900 dark:text-white">{mounted ? lastUpdated : '--:--:--'}</span></span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all dark:border-slate-700 dark:hover:bg-slate-800">
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-accent/20 hover:border-accent/50 transition-all dark:border-slate-700 dark:hover:bg-slate-800 hidden sm:flex">
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Xuất báo cáo</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className="hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors hidden sm:flex">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 dark:border-slate-800">
                  <DropdownMenuItem className="gap-2">
                    <Clock size={14} />
                    <span>Cập nhật: {mounted ? lastUpdated : '--:--:--'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-slate-800" />
                  <DropdownMenuItem className="gap-2">
                    <Download size={14} />
                    <span>Xuất báo cáo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => setSettingsOpen(true)}>
                    <Settings size={14} />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
