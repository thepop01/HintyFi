import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProjects } from '../../src/services/dataService';
import { Project } from '../../src/types';
import { ProfileDropdown } from '../auth/ProfileDropdown';

const Header: React.FC = () => {
  
  const [projectMap, setProjectMap] = useState<Map<string, Project>>(new Map());

  useEffect(() => {
    getProjects().then(projects => {
      const map = new Map<string, Project>();
      projects.forEach(p => {
          if(p.name) map.set(p.name, p)
      });
      setProjectMap(map);
    });
  }, []);

  return (
    <header className="flex-shrink-0 z-50 bg-[#ded6ff] border-b border-border/10">
      <div className="h-12 flex items-center justify-between px-4 sm:px-6">
        <ReactRouterDOM.Link to="/ecosystem" className="flex items-center gap-3">
            <motion.img 
                src="https://res.cloudinary.com/dizoez2x9/image/upload/v1760456318/trends_vtetaz.png"
                alt="HintyFi Logo" 
                className="h-10 w-10 rounded-full"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
            />
            <span className="font-display font-bold text-3xl logo-text hidden sm:block">HintyFi</span>
        </ReactRouterDOM.Link>
        
        <div className="flex items-center gap-4">
          <div className="w-48">
            <ProfileDropdown />
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;