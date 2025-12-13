import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: 'nav.home', icon: Home },
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/faq', label: 'nav.help', icon: HelpCircle },
  { path: '/settings', label: 'nav.settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--header))] border-t border-border/40 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center justify-center py-3 px-5 min-h-tap min-w-[64px] transition-all duration-300 ease-out-expo',
                isActive 
                  ? 'text-[hsl(var(--header-foreground))]' 
                  : 'text-[hsl(var(--header-foreground)/0.6)] hover:text-[hsl(var(--header-foreground))]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 top-1 h-0.5 bg-[hsl(var(--header-foreground))] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs mt-1.5 font-medium">{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
