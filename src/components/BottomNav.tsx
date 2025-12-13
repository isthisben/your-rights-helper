import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Home, LayoutDashboard, Settings, HelpCircle, FileText } from 'lucide-react';
import Dock, { type DockItemData } from './Dock';

const NAV_ITEMS = [
  { path: '/', label: 'nav.home', icon: Home },
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/documents', label: 'nav.documents', icon: FileText },
  { path: '/faq', label: 'nav.help', icon: HelpCircle },
  { path: '/settings', label: 'nav.settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const dockItems: DockItemData[] = NAV_ITEMS.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return {
      icon: <Icon className="h-5 w-5" aria-hidden="true" />,
      label: t(item.label),
      onClick: () => navigate(item.path),
      isActive,
    };
  });

  return <Dock items={dockItems} />;
}
