import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardCheck,
  Users,
  Mail,
  Settings,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useDashboardStats } from '@/hooks/admin/useDashboardStats';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Pending Review', icon: ClipboardCheck, path: '/admin/pending-review', showBadge: true },
  { label: 'Customers', icon: Users, path: '/admin/customers' },
  { label: 'Email Logs', icon: Mail, path: '/admin/email-logs' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout, role } = useAdminAuth();
  const { data: stats } = useDashboardStats();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border-dark bg-bg-dark">
      <SidebarHeader className="px-4 py-5 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">OHS</span>
          </div>
          <div>
            <h2 className="font-heading text-base text-text-light">Admin Panel</h2>
            <p className="text-xs text-text-muted">OHS Remote</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-text-muted text-xs uppercase tracking-wide px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={isActive(item.path, item.exact)}
                  className="text-text-muted hover:text-text-light hover:bg-bg-surface-light data-[active=true]:bg-bg-surface-light data-[active=true]:text-text-light"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.showBadge && stats && stats.pending_review_count > 0 && (
                  <SidebarMenuBadge className="bg-destructive text-white text-xs">
                    {stats.pending_review_count}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}

            {role === 'owner' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/admin/settings')}
                  isActive={isActive('/admin/settings')}
                  className="text-text-muted hover:text-text-light hover:bg-bg-surface-light data-[active=true]:bg-bg-surface-light data-[active=true]:text-text-light"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border-dark p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-bg-surface-light transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-sm font-medium">
                  {adminUser?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-light truncate">{adminUser?.full_name}</p>
                <AdminStatusBadge status={adminUser?.role || 'support'} type="role" />
              </div>
              <ChevronUp className="w-4 h-4 text-text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 bg-bg-surface border-border-dark">
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
