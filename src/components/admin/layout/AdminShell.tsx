import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

export const AdminShell = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-bg-dark">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <AdminTopBar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
