import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Cloud, Ticket, Monitor, Bot, TrendingUp } from 'lucide-react';

const NavigationTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', path: '/' },
    { id: 'monitoring', label: 'Monitoring', path: '/system-health' },
    { id: 'infrastructure', label: 'Infrastructure', path: '/ec2-instances' },
    { id: 'automation', label: 'Automation', path: '/automation-tasks' }
  ];

  const handleTabChange = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id, tab.path)}
            className={`
              py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NavigationTabs;