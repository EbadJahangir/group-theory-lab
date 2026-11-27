import React from 'react';
import {
  BarChart3,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Grid3X3,
  LayoutDashboard,
  Shapes,
  Shuffle,
  X,
} from 'lucide-react';
import type { ModuleId } from '../types/symmetry';
import { Logo } from './Logo';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onReturnWelcome: () => void;
}

interface NavGroup {
  heading: string;
  items: { id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Group Explorers',
    items: [
      { id: 'abelian', label: 'Abelian Group Explorer', icon: Grid3X3 },
      { id: 'cayley', label: 'Cayley Table Generator', icon: Compass },
      { id: 'permutations', label: 'Permutation Explorer', icon: Shuffle },
      { id: 'dihedral', label: 'Dihedral Group Explorer', icon: Shapes },
    ],
  },
  {
    heading: 'Number Theory & Orders',
    items: [
      { id: 'generators', label: 'Generator & Phi Calculator', icon: Calculator },
      { id: 'analysis', label: 'Element Order Analysis', icon: BarChart3 },
    ],
  },
  {
    heading: 'Coursework & Output',
    items: [
      { id: 'learning', label: 'Guided Learning', icon: BookOpen },
      { id: 'reports', label: 'Reports & Verification', icon: FileText },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onReturnWelcome,
}) => {
  const handleSelect = (id: ModuleId) => {
    onSelectModule(id);
    onCloseMobile();
  };

  const sidebarContent = (isMobileDrawer: boolean) => (
    <div className="h-full flex flex-col bg-[#FFFFFF] dark:bg-[#1C221E] border-r border-[#D8D4C9] dark:border-[#2D3730]">
      <div className="min-h-16 py-2 px-4 flex items-center justify-between gap-2 border-b border-[#D8D4C9] dark:border-[#2D3730] shrink-0">
        {collapsed && !isMobileDrawer ? (
          <button
            type="button"
            onClick={onReturnWelcome}
            className="mx-auto cursor-pointer"
            title="GroupTheory Lab Welcome"
          >
            <Logo size={30} showWordmark={false} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onReturnWelcome}
            className="text-left min-w-0 cursor-pointer"
            title="Return to Welcome screen"
          >
            <Logo size={30} showWordmark subtitle="Interactive Abstract Algebra Explorer" />
          </button>
        )}

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="p-2 rounded-md text-[#656B61] dark:text-[#A2ACA0] hover:bg-[#F3F0E8] dark:hover:bg-[#232B25] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:inline-flex p-1.5 rounded-md text-[#656B61] dark:text-[#A2ACA0] hover:bg-[#F3F0E8] dark:hover:bg-[#232B25] cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Primary modules">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="space-y-1">
            {(!collapsed || isMobileDrawer) && (
              <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#656B61] dark:text-[#A2ACA0]">
                {group.heading}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  title={collapsed && !isMobileDrawer ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#526B58] dark:bg-[#6F9278] text-white'
                      : 'text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#F3F0E8] dark:hover:bg-[#232B25]'
                  } ${collapsed && !isMobileDrawer ? 'justify-center' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {(!collapsed || isMobileDrawer) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(false)}</div>
      </aside>

      {/* Mobile / Tablet drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">{sidebarContent(true)}</div>
        </div>
      )}
    </>
  );
};
