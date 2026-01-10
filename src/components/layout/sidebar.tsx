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
} from 'lucide-react';
import {
  Sidebar as BaseSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SettingsModal } from '../settings-modal';

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
      <BaseSidebar
        collapsible="icon"
        className="border-r hidden md:flex"
      >
        <SidebarHeader />
        <SidebarMenu className="flex-grow">
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
               <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                    className: 'bg-primary text-primary-foreground',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}
                tooltip={{
                  children: "Cài đặt",
                  className: 'bg-primary text-primary-foreground',
                }}
              >
                <Settings />
                <span>Cài đặt</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </BaseSidebar>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
