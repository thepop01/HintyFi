import React, { useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectCategory } from '../../src/types';
import { ArrowLeft, ArrowRight, Dna, Gem, Gamepad2, Users, Repeat, Building, Layers, Wallet, Cpu, BrainCircuit, Flame, Rocket, TrendingUp, MessageCircle, Wrench, Shield, Code, Eye, Package, Dice6, Vote, BarChart3, Gamepad, UserCheck } from 'lucide-react';

const categoryConfig: Record<ProjectCategory, { icon: React.ReactElement<{ size?: number | string; className?: string }>; label: string, color: string }> = {
  defi: { icon: <Dna size={12} />, label: 'DeFi', color: 'text-purple-500' },
  dex: { icon: <Repeat size={12} />, label: 'DEX', color: 'text-emerald-500' },
  nft: { icon: <Gem size={12} />, label: 'NFT', color: 'text-sky-500' },
  gaming: { icon: <Gamepad2 size={12} />, label: 'Gaming', color: 'text-red-500' },

  rwa: { icon: <Building size={12} />, label: 'RWA', color: 'text-orange-500' },
  infrastructure: { icon: <Layers size={12} />, label: 'Infrastructure', color: 'text-slate-500' },
  wallet: { icon: <Wallet size={12} />, label: 'Wallets', color: 'text-green-500' },
  depin: { icon: <Cpu size={12} />, label: 'DePIN', color: 'text-fuchsia-500' },
  ai: { icon: <BrainCircuit size={12} />, label: 'AI', color: 'text-cyan-500' },
  meme: { icon: <Flame size={12} />, label: 'Meme', color: 'text-yellow-500' },
  launchpad: { icon: <Rocket size={12} />, label: 'Launchpad', color: 'text-rose-500' },
  'prediction market': { icon: <TrendingUp size={12} />, label: 'Prediction Market', color: 'text-indigo-500' },
  social: { icon: <MessageCircle size={12} />, label: 'Social', color: 'text-pink-500' },
  'other infra': { icon: <Wrench size={12} />, label: 'Other Infra', color: 'text-gray-500' },
  identity: { icon: <UserCheck size={12} />, label: 'Identity', color: 'text-blue-500' },
  'dev tooling': { icon: <Code size={12} />, label: 'Dev Tooling', color: 'text-green-600' },
  privacy: { icon: <Shield size={12} />, label: 'Privacy', color: 'text-slate-600' },
  'other apps': { icon: <Package size={12} />, label: 'Other Apps', color: 'text-amber-500' },
  betting: { icon: <Dice6 size={12} />, label: 'Betting', color: 'text-red-600' },
  governance: { icon: <Vote size={12} />, label: 'Governance', color: 'text-violet-500' },
  analytics: { icon: <BarChart3 size={12} />, label: 'Analytics', color: 'text-emerald-600' },
  'gaming infra': { icon: <Gamepad size={12} />, label: 'Gaming Infra', color: 'text-red-400' },
  'account abstraction': { icon: <Eye size={12} />, label: 'Account Abstraction', color: 'text-cyan-600' },
};

// A more compact and overlapping layout. Overlaps are subtle.
const desktopLayoutConfig = [
    // Row 1 (9 photos)
    { top: '7%', left: '0%', width: '11.5%', rotate: -5 },
    { top: '8%', left: '11%', width: '11.8%', rotate: 7 },
    { top: '6%', left: '22%', width: '11.2%', rotate: -3 },
    { top: '9%', left: '33%', width: '11.5%', rotate: 5 },
    { top: '7%', left: '44%', width: '11.9%', rotate: -8 },
    { top: '8%', left: '55%', width: '11.5%', rotate: 4 },
    { top: '6%', left: '66%', width: '11.6%', rotate: -6 },
    { top: '9%', left: '77%', width: '11.4%', rotate: 9 },
    { top: '8%', left: '88%', width: '11.6%', rotate: -7 },

    // Row 2 (8 photos)
    { top: '25%', left: '11%', width: '11.5%', rotate: 8 },
    { top: '27%', left: '22%', width: '11.7%', rotate: -5 },
    { top: '24%', left: '33%', width: '11.3%', rotate: 6 },
    { top: '26%', left: '44%', width: '11.6%', rotate: -9 },
    { top: '25%', left: '55%', width: '11.5%', rotate: 3 },
    { top: '27%', left: '66%', width: '11.8%', rotate: -7 },
    { top: '24%', left: '77%', width: '11.4%', rotate: 10 },
    { top: '26%', left: '88%', width: '11.5%', rotate: 8 },

    // Row 3 (7 photos)
    { top: '43%', left: '22%', width: '11.6%', rotate: -6 },
    { top: '45%', left: '33%', width: '11.5%', rotate: 8 },
    { top: '42%', left: '44%', width: '11.8%', rotate: -4 },
    { top: '44%', left: '55%', width: '11.4%', rotate: 7 },
    { top: '43%', left: '66%', width: '11.5%', rotate: -9 },
    { top: '45%', left: '77%', width: '11.7%', rotate: 5 },
    { top: '43%', left: '88%', width: '11.8%', rotate: -4 },

    // Row 4 (8 photos)
    { top: '61%', left: '11%', width: '11.8%', rotate: -8 },
    { top: '63%', left: '22%', width: '11.5%', rotate: 4 },
    { top: '60%', left: '33%', width: '11.6%', rotate: -7 },
    { top: '62%', left: '44%', width: '11.3%', rotate: 9 },
    { top: '61%', left: '55%', width: '11.9%', rotate: -5 },
    { top: '63%', left: '66%', width: '11.5%', rotate: 6 },
    { top: '60%', left: '77%', width: '11.7%', rotate: -10 },
    { top: '62%', left: '88%', width: '11.4%', rotate: 6 },

    // Row 5 (9 photos)
    { top: '79%', left: '0%', width: '11.5%', rotate: 6 },
    { top: '81%', left: '11%', width: '11.8%', rotate: -9 },
    { top: '78%', left: '22%', width: '11.5%', rotate: 7 },
    { top: '80%', left: '33%', width: '11.4%', rotate: -5 },
    { top: '79%', left: '44%', width: '11.7%', rotate: 8 },
    { top: '81%', left: '55%', width: '11.5%', rotate: -11 },
    { top: '78%', left: '66%', width: '11.9%', rotate: 4 },
    { top: '80%', left: '77%', width: '11.5%', rotate: -6 },
    { top: '80%', left: '88%', width: '11.7%', rotate: -8 },
];

const isCrowned = (project: Project): boolean => {
    return !!project.is_crowned;
};


interface EcosystemHeroProps {
  projects: Project[];
  // FIX: Added 'hot' to the activeCategory type to match the parent component's state.
  activeCategory: string | 'all' | 'new' | 'hot' | 'crowned';
}

const EcosystemHero: React.FC<EcosystemHeroProps> = ({ projects, activeCategory }) => {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') {
      return projects;
    }
    if (activeCategory === 'new') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return projects.filter(p => new Date(p.created_at).getTime() > thirtyDaysAgo);
    }
    if (activeCategory === 'crowned') {
        return projects.filter(isCrowned);
    }
    if (activeCategory === 'hot') {
        return projects.filter(p => p.is_hot);
    }
    return projects.filter(p => p.category.includes(activeCategory));
  }, [projects, activeCategory]);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  const pageSize = useMemo(() => desktopLayoutConfig.length, []);
  const totalPages = useMemo(() => {
    if (filteredProjects.length === 0) return 0;
    return Math.ceil(filteredProjects.length / pageSize);
  }, [filteredProjects.length, pageSize]);


  // Sort projects alphabetically for a stable order instead of shuffling.
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredProjects]);

  const desktopCollageProjects = useMemo(() => {
    // If there are no projects in the filter, return an empty array.
    if (sortedProjects.length === 0) return [];

    const items = [];
    const startIndex = currentPage * pageSize;

    // Loop to fill the page size, wrapping around the sortedProjects array if necessary.
    // This creates a continuous, looping display of projects for pagination.
    for (let i = 0; i < pageSize; i++) {
        const projectIndex = (startIndex + i) % sortedProjects.length;
        items.push(sortedProjects[projectIndex]);
    }

    // Assign unique animationIds for React's key prop to handle animations smoothly,
    // even when the same project appears multiple times on the screen.
    // The original project ID is preserved for navigation.
    return items.map((p, i) => ({ ...p, animationId: `${p.id}-${currentPage}-${i}` }));
  }, [sortedProjects, currentPage, pageSize]);
  
  const handleNext = () => {
    if (totalPages > 1) {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }
  };

  const handlePrev = () => {
    if (totalPages > 1) {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    }
  };
  
  // This is for the mobile view, which remains a static grid.
  const mobileCollageProjects = useMemo(() => {
    const needed = 15; // Show 15 on mobile
    if (sortedProjects.length === 0) return [];
    
    let result: Project[] = [];
    while (result.length < needed) {
      result = result.concat(sortedProjects);
    }
    
    // Assign unique animationId for React's key prop, preserving original project id.
    return result.slice(0, needed).map((p, i) => ({ ...p, animationId: `${p.id}-${i}` }));
  }, [sortedProjects]);
  

  return (
    <div className="w-full">
      {/* Desktop Layout */}
      <div className="hidden md:block relative w-full h-[60vh] min-h-[500px]">
        
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              className="absolute left-[-0.5%] top-[51%] -translate-y-1/2 z-10 text-on-background pointer-events-none max-w-xs"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="font-display font-extrabold text-2xl tracking-widest uppercase leading-tight">
                {hoveredProject.name}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hoveredProject.category.map(cat => {
                  const category = categoryConfig[cat];
                  if (!category) {
                    console.warn(`Category "${cat}" not found in categoryConfig for project "${hoveredProject.name}"`);
                    return null;
                  }
                  return (
                    <div key={cat} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-semibold bg-black/50 text-white backdrop-blur-sm`}>
                      {React.cloneElement(category.icon, { size: 12, className: category.color })}
                      <span className="font-heading font-bold">{category.label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          className="absolute -left-[15%] top-[11%] h-[100%] w-auto select-none z-0"
          initial={{ x: '-50%', opacity: 0 }}
          animate={{ x: '-15%', opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
            <div className="relative h-full w-full flex items-center justify-center">
                <img
                    src="https://iili.io/KwdzLZb.png"
                    alt="Monad Logo"
                    className="h-full w-auto object-contain opacity-100 pointer-events-none [filter:drop-shadow(7px_7px_6px_#6c6c6c)_drop-shadow(-7px_-7px_6px_#ffffff)]"
                    decoding="async"
                />
            </div>
        </motion.div>

        <div className="absolute top-0 right-0 w-[85%] h-full">
            {/* Navigation Arrows */}
            {totalPages > 1 && (
                <div className="absolute top-[57%] -translate-y-1/2 left-[-5%] xl:left-[-2%] z-30 flex flex-row gap-2 sm:gap-4 mt-2">
                    <motion.button 
                        onClick={handlePrev} 
                        aria-label="Previous projects"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-background text-on-background transition-shadow duration-200 shadow-[4px_4px_8px_rgb(var(--color-primary)/0.4),_-4px_-4px_8px_rgb(var(--color-secondary)/0.4)] active:shadow-[inset_4px_4px_8px_rgb(var(--color-primary)/0.4),inset_-4px_-4px_8px_rgb(var(--color-secondary)/0.4)]"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                    </motion.button>
                    <motion.button 
                        onClick={handleNext}
                        aria-label="Next projects"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-background text-on-background transition-shadow duration-200 shadow-[4px_4px_8px_rgb(var(--color-primary)/0.4),_-4px_-4px_8px_rgb(var(--color-secondary)/0.4)] active:shadow-[inset_4px_4px_8px_rgb(var(--color-primary)/0.4),inset_-4px_-4px_8px_rgb(var(--color-secondary)/0.4)]"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowRight size={20} strokeWidth={3} />
                    </motion.button>
                </div>
            )}
            <div className="relative w-full h-full">
            <AnimatePresence>
                {desktopCollageProjects.map((project, index) => {
                    const config = desktopLayoutConfig[index % desktopLayoutConfig.length];
                    return (
                        <motion.div
                          key={project.animationId}
                          className="absolute bg-surface/10 rounded-lg md:rounded-xl shadow-xl shadow-black/50 p-2 origin-center"
                          style={{
                              top: config.top,
                              left: config.left,
                              width: config.width,
                              aspectRatio: '1/1',
                          }}
                          initial={{ rotate: config.rotate, opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.03, duration: 0.4, type: 'spring', stiffness: 200, damping: 20 } }}
                          exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                          whileHover={{
                              scale: 1.1,
                              rotate: 0,
                              zIndex: 20,
                              boxShadow: "0px 10px 30px rgba(0,0,0,0.3)"
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          onHoverStart={() => setHoveredProject(project)}
                          onHoverEnd={() => setHoveredProject(null)}
                        >
                        <ReactRouterDOM.Link to={`/${project.name.toLowerCase()}`} className="block w-full h-full">
                            <img
                                src={project.logo}
                                alt={project.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </ReactRouterDOM.Link>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative flex flex-col items-start text-left py-4">
        <div className="absolute -left-1/4 top-16 w-full h-auto select-none pointer-events-none">
          <img
            src="https://iili.io/KwdzLZb.png"
            alt="Monad Logo"
            className="h-full w-auto object-contain opacity-100 [filter:drop-shadow(7px_7px_6px_#6c6c6c)_drop-shadow(-7px_-7px_6px_#ffffff)]"
            decoding="async"
          />
        </div>
        
        <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-4 w-full z-10">
          {mobileCollageProjects.map((project) => (
            <ReactRouterDOM.Link
              to={`/${project.name.toLowerCase()}`}
              key={project.animationId}
              className="block bg-surface/10 rounded-lg shadow-xl shadow-black/50 p-2 aspect-square"
            >
              <img
                src={project.logo}
                alt={project.name}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </ReactRouterDOM.Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EcosystemHero;