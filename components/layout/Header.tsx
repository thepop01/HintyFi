import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEvents, getProjects } from '../../src/services/dataService';
import { Event, Project, AmaEvent, CampaignEvent } from '../../src/types';
import { ProfileDropdown } from '../auth/ProfileDropdown';
import { Megaphone, Calendar } from 'lucide-react';

type TickerItem = Event & { projectLogo?: string };

const Header: React.FC = () => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const allEvents = getEvents();
    const allProjects = getProjects();
    const now = Date.now();
    
    const projectLogoMap = new Map<string, string>();
    allProjects.forEach(p => {
        if (p.name) {
            projectLogoMap.set(p.name, p.logo);
        }
    });

    const liveAndUpcoming = allEvents
      .filter(e => {
        const eventTime = e.type === 'ama' ? (e as AmaEvent).eventTime : (e as CampaignEvent).endTime;
        return eventTime >= now;
      })
      .sort((a, b) => {
        const timeA = a.type === 'ama' ? (a as AmaEvent).eventTime : (a as CampaignEvent).startTime;
        const timeB = b.type === 'ama' ? (b as AmaEvent).eventTime : (b as CampaignEvent).startTime;
        return timeA - timeB;
      })
      .map(event => ({
          ...event,
          projectLogo: event.projectName ? projectLogoMap.get(event.projectName) : undefined,
      }));
      
    setTickerItems(liveAndUpcoming.slice(0, 10)); // take up to 10
  }, []);
  
  const projectMap = useMemo(() => {
    const projects = getProjects();
    const map = new Map<string, Project>();
    projects.forEach(p => {
        if(p.name) map.set(p.name, p)
    });
    return map;
  }, []);

  return (
    <header className="flex-shrink-0 z-50 bg-[#ded6ff] border-b border-border/10">
      <div className="h-12 flex items-center justify-between px-4 sm:px-6">
        <ReactRouterDOM.Link to="/" className="flex items-center gap-3">
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
      
      {/* Event Ticker */}
      {tickerItems.length > 0 && (
        <div className="h-8 bg-surface/50 border-t border-border/10 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center">
            <div className="flex w-max marquee group-hover:[animation-play-state:paused]">
              {[...tickerItems, ...tickerItems].map((item, index) => {
                const isCampaign = item.type === 'campaign';
                const Icon = isCampaign ? Megaphone : Calendar;
                const link = isCampaign ? `/campaign/${item.id}` : `/campaigns`;
                
                return (
                  <ReactRouterDOM.Link to={link} key={`${item.id}-${index}`} className="flex items-center gap-3 px-6 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">
                    {item.projectLogo && <img src={item.projectLogo} alt={item.projectName} className="w-5 h-5 rounded-full" />}
                    <Icon size={16} className="text-primary" />
                    <span>{item.title}</span>
                  </ReactRouterDOM.Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;