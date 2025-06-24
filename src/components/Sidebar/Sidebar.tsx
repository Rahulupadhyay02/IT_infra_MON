import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Heart, AlertTriangle, Server, BarChart3, 
  Scale, Ticket, Package, Shield, Zap, Clock 
} from 'lucide-react';

const Sidebar: React.FC = () => {
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
        { id: '/ec2-instances', icon: Server, label: 'EC2 Instances' },
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
    }
  ];

  return (
    <div className="w-64 py-5 h-full overflow-y-auto">
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <div className="px-5 pb-2">
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
                  className={`w-full flex items-center px-5 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'text-white bg-slate-700/50 border-blue-400 shadow-sm'
                      : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.label}
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