import React, { useState, useEffect } from 'react';
import { Globe, Clock, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';

const TopHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  return (
    <div className="bg-slate-800 text-white px-5 py-2 flex justify-between items-center text-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>Server Status: All Systems Operational</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Last Updated: Just now</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>3 Alerts</span>
        </div>
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs">
                {getInitials(user.email || 'Admin User')}
              </div>
              <span>{user.email}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await auth.signOut();
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopHeader;