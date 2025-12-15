import React, { useState } from 'react';
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
  X,
  Handshake,
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
    className={`relative flex items-center h-12 px-4 rounded-lg transition-colors font-semibold overflow-hidden ${!isExpanded ? 'justify-center' : 'gap-4'
      } ${isActive
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
    className={`flex items-center h-9 rounded-md text-sm font-medium transition-colors w-full ${isExpanded ? 'px-3 gap-3' : 'justify-center'
      } ${isActive ? 'text-primary bg-primary/10' : 'text-on-background-variant hover:text-on-background hover:bg-white/5'
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
        className={`flex items-center h-12 w-full px-4 rounded-lg transition-colors font-semibold overflow-hidden ${!isExpanded ? 'justify-center' : 'gap-4'
          } ${isParentActive && isExpanded
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
  const [isMobile, setIsMobile] = useState(false);
  const location = ReactRouterDOM.useLocation();
  const { currentUser } = useAuth();

  // Check if device is mobile/touch device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarInteraction = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  };

  const isProjectPathActive = location.pathname === '/' || location.pathname.startsWith('/ecosystem') || location.pathname.startsWith('/early-projects');
  const isEventsPathActive = location.pathname.startsWith('/campaigns') || location.pathname.startsWith('/quest') || location.pathname.startsWith('/tasks') || location.pathname.startsWith('/this-week');
  const isCollaborationActive = location.pathname.startsWith('/collaboration') || location.pathname.startsWith('/collab');
  const isLedgerActive = location.pathname.startsWith('/ledger');

  const isSuperAdminActive = location.pathname.startsWith('/super-admin');

  return (
    <motion.aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleSidebarInteraction}
      animate={{ width: isExpanded ? '14.4rem' : '4.5rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sidebar bg-[#efd6ff] flex-shrink-0 z-40 border-r border-border/10 h-full flex flex-col cursor-pointer"
    >
      {/* Mobile overlay when expanded */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1] md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className="p-2 flex flex-col h-full overflow-y-auto overflow-x-hidden hide-scrollbar pt-4">
        {/* Mobile expand indicator */}
        {isMobile && !isExpanded && (
          <div className="text-center text-xs text-on-background-variant/50 mb-2">
            Tap to expand
          </div>
        )}

        {/* Mobile close button when expanded */}
        {isMobile && isExpanded && (
          <div className="flex justify-end mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-on-background-variant hover:text-on-background p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <nav className="flex flex-col space-y-2">
          <CollapsibleMenu icon={<Package size={24} />} label="Project" isExpanded={isExpanded} isParentActive={isProjectPathActive}>
            <SubNavLink to="/" label="Ecosystem" icon={<Users size={16} />} isActive={location.pathname === '/'} />
            <SubNavLink to="/nft" label="NFT" icon={<Gem size={16} />} isActive={location.pathname === '/nft'} />
            <SubNavLink to="/meme" label="Meme" icon={<Flame size={16} />} isActive={location.pathname === '/meme'} />

            <SubNavLink to="/early-projects" label="Early Projects" icon={<Sparkles size={16} />} isActive={location.pathname === '/early-projects'} />
          </CollapsibleMenu>

          <CollapsibleMenu icon={<Calendar size={24} />} label="Events" isExpanded={isExpanded} isParentActive={isEventsPathActive}>
            <div className="relative">
              <SubNavLink to="#" label="Campaigns" icon={<Sparkles size={16} />} isActive={location.pathname === '/campaigns'} />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-full">
                Soon
              </span>
            </div>
            <SubNavLink to="/tasks" label="Tasks" icon={<Sparkles size={16} />} isActive={location.pathname === '/tasks'} />
            <SubNavLink to="/this-week" label="This Week" icon={<CalendarDays size={16} />} isActive={location.pathname.startsWith('/this-week')} />
          </CollapsibleMenu>

          <NavLink to="/collabs" icon={<Handshake size={24} />} label="Collabs" isExpanded={isExpanded} isActive={isCollaborationActive} />

          <NavLink to="/ledger" icon={<ScrollText size={24} />} label="Ledger" isExpanded={isExpanded} isActive={isLedgerActive} />



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
                isActive={location.pathname.startsWith('/super-admin/project-detail')}
              />
              <SubNavLink
                to="/super-admin/events"
                label="Manage Events"
                icon={<CalendarDays size={16} />}
                isActive={location.pathname === '/super-admin/events'}
              />
              <SubNavLink
                to="/super-admin/nfts"
                label="Manage NFT"
                icon={<Gem size={16} />}
                isActive={location.pathname === '/super-admin/nfts'}
              />


              <SubNavLink
                to="/super-admin/collabs"
                label="Manage Collabs"
                icon={<Handshake size={16} />}
                isActive={location.pathname === '/super-admin/collabs'}
              />
            </CollapsibleMenu>
          )}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;