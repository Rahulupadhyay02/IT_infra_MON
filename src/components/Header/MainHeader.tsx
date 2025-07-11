import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import SearchBar from '../Search/SearchBar';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const MainHeader = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <header 
      className={`sticky top-0 border-b border-gray-200 px-5 py-4 flex justify-between items-center shadow-sm z-[100] transition-all duration-1000 overflow-hidden ${
        isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-32'
      }`}
      style={{ position: 'relative' }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-200 via-white to-red-200 opacity-90 pointer-events-none z-0" />
      <div className="flex items-center gap-4 relative z-10">
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-1000 hover:scale-125 hover:rotate-12 ${
            isLoaded ? 'scale-100 rotate-0 shadow-xl' : 'scale-0 rotate-180 shadow-none'
          }`}
        >
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div 
          className={`text-2xl font-bold text-slate-800 transition-all duration-1000 hover:text-blue-600 hover:scale-110 ${
            isLoaded ? 'translate-x-0 opacity-100 animate-pulse-color' : '-translate-x-16 opacity-0'
          }`}
        >
          RR Group
        </div>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div 
          className={`relative transition-all duration-1000 delay-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <SearchBar />
        </div>
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-blue-50 ${
            isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
          }`}
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 animate-pulse" />
          Settings
        </button>
      </div>
    </header>
  );
};

export default MainHeader;