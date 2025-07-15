import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Heart, AlertTriangle, Server, BarChart3, 
  Scale, Ticket, Package, Shield, Zap, Clock, 
  ChevronLeft, ChevronRight, FileText 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

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
    <div className={`relative h-screen overflow-y-auto overflow-x-hidden bg-gray-100 border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Gradient Overlay Layer */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-50 via-white to-red-50 opacity-90 pointer-events-none z-0" />

      <div className="relative z-10 h-full">
        {/* Collapse/Expand Button */}
        <div className="flex justify-end items-center px-2 pt-3 pb-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-full p-2 bg-gray-300 hover:bg-gray-400 transition-colors shadow"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5 text-gray-700" /> : <ChevronLeft className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div className={`px-5 pb-2 ${collapsed ? 'hidden' : ''}`}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.id;
                // Special logic for Tickets button
                const isTickets = item.id === '/tickets';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isTickets && user && user.email === 'ithelpdesk@rr.com.in') {
                        navigate('/it-tickets');
                      } else {
                        navigate(item.id);
                      }
                    }}
                    className={`w-full flex items-center transition-all duration-200 border-l-2 px-2 py-2.5 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 border-blue-500'
                        : 'text-gray-700 border-transparent hover:bg-blue-600 hover:text-white'

                    } ${collapsed ? 'justify-center px-0' : 'px-5'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'} transition-colors`} />
                    {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
