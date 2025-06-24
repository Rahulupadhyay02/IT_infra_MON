import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  return (
    <div className="relative min-h-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/src/assets/images/common.avif")',
          filter: 'brightness(0.9) contrast(1.1)',
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {title}
          </h1>
        </div>

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper; 