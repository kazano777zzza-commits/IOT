'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Timer,
  History,
  HardDrive,
  Settings,
  Activity,
} from 'lucide-react';
import { SettingsModal } from '../settings-modal';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: '/tong-quan', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/thoi-gian-thuc', label: 'Thời gian thực', icon: Timer },
  { href: '/lich-su', label: 'Lịch sử', icon: History },
  { href: '/thiet-bi', label: 'Thiết bị', icon: HardDrive },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col border-r bg-background z-50">
          {/* Logo */}
          <div className="flex h-14 items-center justify-center border-b">
            <Link href="/tong-quan">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 p-2">
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-primary text-primary-foreground">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex h-10 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-primary text-primary-foreground">
                Cài đặt
              </TooltipContent>
            </Tooltip>
          </div>
        </aside>
      </TooltipProvider>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
