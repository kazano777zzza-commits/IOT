'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Timer,
  History,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/tong-quan', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/thoi-gian-thuc', label: 'Thời gian thực', icon: Timer },
  { href: '/lich-su', label: 'Lịch sử', icon: History },
  { href: '/thiet-bi', label: 'Thiết bị', icon: HardDrive },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
