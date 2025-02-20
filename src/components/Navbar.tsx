import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGoogleStore } from "../store/googleStore";
import { googleLogout } from "@react-oauth/google";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout: appLogout } = useAuthStore();
  const { googleUser, setGoogleUser, setAuthorized } = useGoogleStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoogleLogout = () => {
    googleLogout();
    setGoogleUser(null);
    setAuthorized(false);
    setIsDropdownOpen(false);
  };

  const handleAppLogout = () => {
    appLogout();
    setIsDropdownOpen(false);
  };

  const handleChangeProvider = () => {
    navigate("/change-provider");
    setIsDropdownOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/0 backdrop-blur-lg shadow-lg" 
          : "bg-white"
      }`}
    >
      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-6">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a 
              href="/" 
              className="flex items-center transform transition hover:scale-105"
            >
              <img
                src="https://cdn.subspace.money/grow90_tracks/images/BqmsrUnUNTucPV2rY6wm.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {googleUser && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
                >
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    className="h-10 w-10 rounded-full ring-2 ring-white shadow-md"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {googleUser.name}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`} 
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transform transition-all duration-200 ease-out">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{googleUser.name}</p>
                      <p className="text-sm text-gray-500">{googleUser.email}</p>
                    </div>
                    <button
                      onClick={handleChangeProvider}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <span>Change Provider</span>
                    </button>
                    <button
                      onClick={handleGoogleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {user && (
              <button
                onClick={handleAppLogout}
                className="px-6 py-2.5 rounded-full bg-[#4355BC] text-white text-sm font-medium 
                  hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-xl">
            {googleUser && (
              <div className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name}
                    className="h-10 w-10 rounded-full ring-2 ring-white"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{googleUser.name}</div>
                    <div className="text-sm text-gray-500">{googleUser.email}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleChangeProvider}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Change Provider
                  </button>
                  <button
                    onClick={handleGoogleLogout}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
            
            {user && (
              <div className="px-4 py-3">
                <button
                  onClick={handleAppLogout}
                  className="w-full px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 
                    rounded-lg transition-colors hover:from-blue-700 hover:to-indigo-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;