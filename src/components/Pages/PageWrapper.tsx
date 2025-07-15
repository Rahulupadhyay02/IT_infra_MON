import React from 'react';
import commonBg from '../../assets/images/common.avif';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  sidebarCollapsed?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title, sidebarCollapsed }) => {
  const bgMargin = sidebarCollapsed ? 'ml-20' : 'ml-64';
  return (
    <div className="relative min-h-full">
      {/* Background Image */}
      <div 
        className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat ${bgMargin}`}
        style={{
          backgroundImage: `url(${commonBg})`,
          filter: 'brightness(0.6) contrast(1.0)',
        }}
      />
      {/* Optional: Add a subtle overlay for readability */}
      <div className="absolute inset-0 z-0 bg-black bg-opacity-10 pointer-events-none" />
      {/* Content Container */}
      <div className="relative z-10 p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>
        </div>
        {/* Page Content */}
        <div className="space-y-6 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper; 