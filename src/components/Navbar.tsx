import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGoogleStore } from '../store/googleStore';
import { ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { googleUser, googleLogout } = useGoogleStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          </div>
          
          {/* User Section */}
          <div className="flex items-center space-x-4 relative">
            {googleUser && (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name} 
                    className="h-10 w-10 rounded-full border border-gray-300" 
                  />
                  <ChevronDown className="ml-2 text-gray-600" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                    <p className="px-4 py-2 text-sm text-gray-700">{googleUser.name}</p>
                    <button 
                      onClick={googleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout from Google
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {user && (
              <button
                onClick={logout}
                className="px-4 py-2 border border-transparent text-sm rounded-md text-white bg-[#2B3779] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;