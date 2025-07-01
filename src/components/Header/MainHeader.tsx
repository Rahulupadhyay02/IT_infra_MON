import React from 'react';
import { Settings } from 'lucide-react';
import SearchBar from '../Search/SearchBar';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const MainHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 py-4 flex justify-between items-center shadow-sm z-[100]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="text-2xl font-bold text-slate-800">RR Group</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchBar />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </header>
  );
};

export default MainHeader;