import React from 'react';
import Sidebar from '../Sidebar/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar collapsed={false} setCollapsed={() => {}} />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

export default DashboardLayout; 