import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Heart, AlertTriangle, Server, BarChart3, 
  Scale, Ticket, Package, Shield, Zap, Clock, ChevronLeft, ChevronRight, FileText 
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        { id: '/', icon: Home, label: 'Home Dashboard' },
        { id: '/system-health', icon: Heart, label: 'System Health' },
        { id: '/alerts', icon: AlertTriangle, label: 'Alerts & Notifications' },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { id: '/security-diagnostics', icon: Server, label: 'Security & Diagnostics' },
        { id: '/cloudwatch', icon: BarChart3, label: 'CloudWatch Metrics' },
        { id: '/load-balancers', icon: Scale, label: 'Load Balancers' },
      ]
    },
    {
      title: 'IT Service Management',
      items: [
        { id: '/tickets', icon: Ticket, label: 'Tickets' },
        { id: '/asset-inventory', icon: Package, label: 'Asset Inventory' },
        { id: '/patch-management', icon: Shield, label: 'Patch Management' },
      ]
    },
    {
      title: 'Automation',
      items: [
        { id: '/automation-tasks', icon: Zap, label: 'Automation Tasks' },
        { id: '/scheduled-jobs', icon: Clock, label: 'Scheduled Jobs' },
      ]
    },
    {
      title: 'Reports',
      items: [
        { id: '/report', icon: FileText, label: 'Reports' },
      ]
    }
  ];

  return (
    <div
      className={`h-full overflow-y-auto bg-gradient-to-b from-slate-800 to-slate-900 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Collapse/Expand Button */}
      <div className="flex justify-end items-center px-2 pt-3 pb-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-2 bg-slate-700 hover:bg-slate-600 transition-colors shadow-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5 text-blue-300" /> : <ChevronLeft className="w-5 h-5 text-blue-300" />}
        </button>
      </div>
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <div className={`px-5 pb-2 ${collapsed ? 'hidden' : ''}`}>
            <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center transition-all duration-200 border-l-2 px-2 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'text-white bg-slate-700/50 border-blue-400 shadow-sm'
                      : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-700/30'
                  } ${collapsed ? 'justify-center px-0' : 'px-5'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'} transition-colors`} />
                  {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;