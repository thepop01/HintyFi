import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileDropdown } from '../auth/ProfileDropdown';

const Header: React.FC = () => {

  return (
    <header className="flex-shrink-0 z-50 bg-[#ded6ff] border-b border-border/10">
      <div className="h-12 sm:h-14 flex items-center justify-center relative px-4 sm:px-6">
        <ReactRouterDOM.Link to="/ecosystem" className="flex items-center gap-2 sm:gap-3">
            <motion.img
                src="https://res.cloudinary.com/dizoez2x9/image/upload/v1760456318/trends_vtetaz.png"
            alt="HintyFi Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
        />
        <span className="font-display font-bold text-xl sm:text-3xl logo-text hidden xs:block">HintyFi</span>
        </ReactRouterDOM.Link>
        
        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
          <div className="w-20 sm:w-32 md:w-48">
            <ProfileDropdown />
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;