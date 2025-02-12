import React, { useState } from 'react';
import { Users, PhoneForwarded, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SidePanel = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Hover trigger area */}
      <div
        className="fixed left-0 top-0 w-2 h-full bg-transparent z-600"
        onMouseEnter={() => setIsExpanded(true)}
      />

      {/* Animated Side Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 h-full bg-[#1F2937] text-white shadow-lg z-30"
            onMouseLeave={() => setIsExpanded(false)}
          >
            <div className="flex flex-col space-y-0 px-6 py-4">
              <div className="mb-10 flex items-center justify-between">
                <img
                  src="https://cdn.subspace.money/grow90_tracks/images/Jy0e6SZqiGaIMShho6c4.png"
                  alt="Logo"
              className="h-8 w-auto"
                  
                />
              </div>

              <NavItem to="/agents" icon={<Users />} label="Home" isActive={isActive('/agents')} />
              <NavItem to="/edit-agents" icon={<Users />} label="Edit Agents" isActive={isActive('/edit-agents')} />
              <NavItem to="/call-forwarding" icon={<PhoneForwarded />} label="Call Forwarding" isActive={isActive('/call-forwarding')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const NavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
  <Link
    to={to}
    className={`flex items-center justify-start w-[200px] h-[48px] space-x-3 px-4 py-2 rounded-lg text-sm text-[14px] transition-all duration-300`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);




export default SidePanel;
