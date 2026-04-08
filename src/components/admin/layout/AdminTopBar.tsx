import { useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, Key, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useSidebar } from '@/components/ui/sidebar';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useState } from 'react';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/pending-review': 'Pending Review',
  '/admin/customers': 'Customers',
  '/admin/email-logs': 'Email Logs',
  '/admin/settings': 'Settings',
};

function getBreadcrumbs(pathname: string): { label: string; path?: string }[] {
  // Detail pages: /admin/orders/123 or /admin/customers/456
  const orderMatch = pathname.match(/^\/admin\/orders\/(\d+)$/);
  if (orderMatch) {
    return [
      { label: 'Orders', path: '/admin/orders' },
      { label: `Order #${orderMatch[1]}` },
    ];
  }

  const customerMatch = pathname.match(/^\/admin\/customers\/(\d+)$/);
  if (customerMatch) {
    return [
      { label: 'Customers', path: '/admin/customers' },
      { label: `Customer #${customerMatch[1]}` },
    ];
  }

  const label = routeLabels[pathname];
  if (label) return [{ label }];

  return [{ label: 'Dashboard' }];
}

export const AdminTopBar = () => {
  const { toggleSidebar } = useSidebar();
  const { adminUser, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <>
      <header className="h-14 border-b border-border-dark bg-bg-dark flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-text-muted hover:text-text-light hover:bg-bg-surface-light"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {index > 0 && <BreadcrumbSeparator className="text-text-muted" />}
                  <BreadcrumbItem>
                    {crumb.path ? (
                      <BreadcrumbLink
                        onClick={() => navigate(crumb.path!)}
                        className="text-text-muted hover:text-text-light cursor-pointer"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-text-light">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-bg-surface-light rounded-lg px-2 py-1.5 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-medium">
                  {adminUser?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <span className="text-sm text-text-light hidden sm:inline">{adminUser?.full_name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-bg-surface border-border-dark">
            <DropdownMenuItem
              onClick={() => setPasswordDialogOpen(true)}
              className="text-text-light focus:bg-bg-surface-light cursor-pointer"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-dark" />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </>
  );
};
