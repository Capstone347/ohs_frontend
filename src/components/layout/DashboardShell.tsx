import { Outlet, Link } from 'react-router-dom';
import { Plus, LogOut, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

export const DashboardShell = () => {
  const { user, logout } = useAuth();

  const initial = user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-wizard-bg">
      <header className="h-16 bg-white border-b border-wizard-border">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="font-heading text-xl text-wizard-text">
            OHS Remote
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/step-1">
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">New Order</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {initial}
                  </div>
                  <span className="hidden sm:inline text-sm text-wizard-text-muted max-w-[160px] truncate">
                    {user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/orders" className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
};
