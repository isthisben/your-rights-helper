import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'nav.home', icon: Home },
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/faq', label: 'nav.help', icon: HelpCircle },
  { path: '/settings', label: 'nav.settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-4 min-h-tap min-w-[64px] transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs mt-1 font-medium">{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
