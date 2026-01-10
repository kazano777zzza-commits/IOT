'use client';

import * as React from 'react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="transition-all duration-300 md:pl-[5.5rem]">
           <Header />
           <div className="p-4 lg:p-6">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
