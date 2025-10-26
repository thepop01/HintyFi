import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  ScrollText,
  Shield,
  Package,
  Sparkles,
  Rocket,
  Flame,
  Gem,
  Briefcase,
  FileText,
  HelpCircle,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isActive: boolean;
  end?: boolean;
}> = ({ to, icon, label, isExpanded, isActive, end }) => (
  <ReactRouterDOM.NavLink
    to={to}
    end={end}
    className={`relative flex items-center h-12 px-4 rounded-lg transition-colors font-semibold overflow-hidden ${
      !isExpanded ? 'justify-center' : 'gap-4'
    } ${
      isActive
        ? 'bg-primary text-on-primary'
        : 'text-on-background-variant hover:text-on-background hover:bg-white/5'
    }`}
    title={!isExpanded ? label : ''}
  >
    {icon}
    <AnimatePresence>
      {isExpanded && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.1 } }}
          exit={{ opacity: 0, width: 0, transition: { duration: 0.15 } }}
          className="whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </ReactRouterDOM.NavLink>
);

const SubNavLink: React.FC<{ to: string, label: string, icon: React.ReactNode, isActive: boolean, isExpanded?: boolean }> = ({ to, label, icon, isActive, isExpanded }) => (
    <ReactRouterDOM.NavLink
      to={to}
      className={`flex items-center h-9 rounded-md text-sm font-medium transition-colors w-full ${
          isExpanded ? 'px-3 gap-3' : 'justify-center'
      } ${
          isActive ? 'text-primary bg-primary/10' : 'text-on-background-variant hover:text-on-background hover:bg-white/5'
      }`}
      title={!isExpanded ? label : ''}
    >
      {icon}
      <AnimatePresence>
        {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.15 } }}
              exit={{ opacity: 0, width: 0, transition: { duration: 0.1 } }}
              className="whitespace-nowrap"
            >
                {label}
            </motion.span>
        )}
      </AnimatePresence>
    </ReactRouterDOM.NavLink>
);

const ComingSoonSubNavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isExpanded?: boolean;
}> = ({ icon, label, isExpanded }) => (
  <div
    className={`relative flex items-center h-9 rounded-md text-sm font-medium w-full cursor-not-allowed text-on-background-variant/50 ${
        isExpanded ? 'px-3 gap-3' : 'justify-center'
    }`}
  >
    {icon}
    <AnimatePresence>
      {isExpanded && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.15 } }}
          exit={{ opacity: 0, width: 0, transition: { duration: 0.1 } }}
          className="whitespace-nowrap relative flex-grow min-w-0 bg-white rounded-md overflow-hidden"
        >
          <span className="blur-sm select-none pointer-events-none px-2">{label}</span>
          <span 
            className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black pointer-events-none"
          >
            Coming Soon
          </span>
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);


const CollapsibleMenu: React.FC<{
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  isParentActive: boolean;
  children: React.ReactNode;
}> = ({ icon, label, isExpanded, isParentActive, children }) => {
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isExpanded: isExpanded } as any);
    }
    return child;
  });

  return (
    <div>
      <div
        className={`flex items-center h-12 w-full px-4 rounded-lg transition-colors font-semibold overflow-hidden ${
            !isExpanded ? 'justify-center' : 'gap-4'
        } ${
          isParentActive && isExpanded
            ? 'bg-primary text-on-primary' 
            : isParentActive ? 'text-primary' : 'text-on-background-variant hover:text-on-background hover:bg-white/5'
        }`}
        title={!isExpanded ? label : ''}
      >
        {icon}
        <AnimatePresence>
            {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.1 } }}
                  exit={{ opacity: 0, width: 0, transition: { duration: 0.15 } }}
                  className="whitespace-nowrap flex-grow text-left"
                >
                  {label}
                </motion.span>
            )}
        </AnimatePresence>
      </div>
      
        {isExpanded ? (
          <div
            className="overflow-hidden flex flex-col pt-1 pl-4 space-y-1"
          >
            {childrenWithProps}
          </div>
        ) : (
          <div
            className="overflow-hidden flex flex-col items-center pt-1 space-y-1"
          >
            {childrenWithProps}
          </div>
        )}
    </div>
  );
};


const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = ReactRouterDOM.useLocation();
  const { currentUser } = useAuth();

  const isProjectPathActive = location.pathname === '/' || location.pathname.startsWith('/ecosystem') || location.pathname.startsWith('/early-projects');
  const isEventsPathActive = location.pathname.startsWith('/campaigns') || location.pathname.startsWith('/quest') || location.pathname.startsWith('/tasks') || location.pathname.startsWith('/this-week');
  const isCredoActive = location.pathname.startsWith('/credo');
  const isAdminsActive = location.pathname.startsWith('/admin');
  const isSuperAdminActive = location.pathname.startsWith('/super-admin');

  return (
    <motion.aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ width: isExpanded ? '14.4rem' : '4.5rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-[#efd6ff] flex-shrink-0 z-40 border-r border-border/10 h-full flex flex-col"
    >
      <div className="p-2 flex flex-col h-full overflow-y-auto overflow-x-hidden hide-scrollbar pt-4">
        <nav className="flex flex-col space-y-2">
            <CollapsibleMenu icon={<Package size={24} />} label="Project" isExpanded={isExpanded} isParentActive={isProjectPathActive}>
              <SubNavLink to="/" label="Ecosystem" icon={<Users size={16} />} isActive={location.pathname === '/'} />
              <SubNavLink to="/ecosystem/nft" label="NFT" icon={<Gem size={16} />} isActive={location.pathname === '/ecosystem/nft'} />
              <SubNavLink to="/ecosystem/meme" label="Meme" icon={<Flame size={16} />} isActive={location.pathname === '/ecosystem/meme'} />
              <ComingSoonSubNavLink label="IDO/ICO" icon={<Sparkles size={16} />} />
              <ComingSoonSubNavLink label="Early Projects" icon={<Sparkles size={16} />} />
            </CollapsibleMenu>
            
            <CollapsibleMenu icon={<Calendar size={24} />} label="Events" isExpanded={isExpanded} isParentActive={isEventsPathActive}>
               <ComingSoonSubNavLink label="Campaigns" icon={<Sparkles size={16} />} />
               <ComingSoonSubNavLink label="Tasks" icon={<Sparkles size={16} />} />
               <SubNavLink to="/this-week" label="This Week" icon={<CalendarDays size={16} />} isActive={location.pathname.startsWith('/this-week')} />
            </CollapsibleMenu>
            
            <NavLink to="/credo" icon={<ScrollText size={24} />} label="Credo" isExpanded={isExpanded} isActive={isCredoActive} />
            
            {(currentUser?.role === 'project_admin' || currentUser?.role === 'super_admin') && (
              <NavLink to="/admin" icon={<Shield size={24} />} label="Admin Dashboard" isExpanded={isExpanded} isActive={isAdminsActive} />
            )}
            
            {currentUser?.role === 'super_admin' && (
              <CollapsibleMenu icon={<Shield size={24} />} label="Super Admin" isExpanded={isExpanded} isParentActive={isSuperAdminActive}>
                <SubNavLink 
                    to="/super-admin/users" 
                    label="Users" 
                    icon={<Users size={16} />} 
                    isActive={location.pathname === '/super-admin/users' || location.pathname === '/super-admin'} 
                />
                <SubNavLink 
                    to="/super-admin/project-detail" 
                    label="Project Detail" 
                    icon={<Briefcase size={16} />} 
                    isActive={location.pathname.startsWith('/super-admin/project-detail') || location.pathname.startsWith('/super-admin/project-management')} 
                />
                <SubNavLink 
                    to="/super-admin/content" 
                    label="Manage Content" 
                    icon={<FileText size={16} />} 
                    isActive={location.pathname === '/super-admin/content'} 
                />
                <SubNavLink 
                    to="/super-admin/quests" 
                    label="Manage Quests" 
                    icon={<HelpCircle size={16} />} 
                    isActive={location.pathname === '/super-admin/quests'} 
                />
                <SubNavLink 
                    to="/super-admin/nfts" 
                    label="Manage NFT" 
                    icon={<Gem size={16} />} 
                    isActive={location.pathname === '/super-admin/nfts'} 
                />
                <SubNavLink 
                    to="/super-admin/memes" 
                    label="Manage Meme" 
                    icon={<Flame size={16} />} 
                    isActive={location.pathname === '/super-admin/memes'} 
                />
                <SubNavLink 
                    to="/super-admin/idos" 
                    label="Manage IDO" 
                    icon={<Rocket size={16} />} 
                    isActive={location.pathname === '/super-admin/idos'} 
                />
              </CollapsibleMenu>
            )}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;