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
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col border-r bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 z-50 transition-colors">
          {/* Logo */}
          <div className="flex h-14 items-center justify-center border-b border-slate-200 dark:border-slate-800">
            <Link href="/tong-quan">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple/25">
                <Activity className="h-5 w-5 text-white" />
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
                        ? "bg-purple-600 text-white dark:bg-purple-600"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
          <div className="p-2 border-t border-slate-200 dark:border-slate-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex h-10 w-full items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-purple-600 text-white dark:bg-purple-600">
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
