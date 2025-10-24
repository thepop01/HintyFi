import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { getWeeklyDiscordEvents, getProjects, getSiteContentSettings } from '../src/services/dataService';
import { WeeklyDiscordEvent, Project, ProjectCategory } from '../src/types';
import { Calendar, Gamepad2, Users, Gem, Mic, Brush, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Event Type Configuration ---
const eventTypeConfig: Record<WeeklyDiscordEvent['type'], { icon: React.ReactNode; color: string; label: string }> = {
    gaming: { icon: <Gamepad2 size={16} />, color: 'bg-red-500/80', label: 'Gaming' },
    community: { icon: <Users size={16} />, color: 'bg-teal-500/80', label: 'Community' },
    mint: { icon: <Gem size={16} />, color: 'bg-sky-500/80', label: 'Mint' },
    ama: { icon: <Mic size={16} />, color: 'bg-purple-500/80', label: 'AMA' },
    creative: { icon: <Brush size={16} />, color: 'bg-orange-500/80', label: 'Creative' },
};

// --- Gradient Backgrounds for each day ---
const dayGradients = [
    'from-rose-100 to-teal-100',
    'from-sky-100 to-fuchsia-100',
    'from-amber-100 to-lime-100',
    'from-violet-100 to-orange-100',
    'from-emerald-100 to-cyan-100',
    'from-red-100 to-yellow-100',
    'from-indigo-100 to-pink-100',
];

// --- Helper to determine if a project is "crowned" ---
const isCrowned = (project: Project): boolean => {
    const hasRolePoints = project.discordRoles?.some(role => role.points && role.points > 0);
    const hasNftPoints = project.nftCollections?.some(collection => collection.pointsPerDay && collection.pointsPerDay > 0);
    const hasTokenPoints = project.tokenHoldingTiers && project.tokenHoldingTiers.length > 0;
    return !!(hasRolePoints || hasNftPoints || hasTokenPoints);
};


// --- Highlight Event Components ---
const CountdownTimer: React.FC<{ endTime: number; onEnd?: () => void }> = ({ endTime, onEnd }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else if (onEnd) {
            onEnd();
        }
        return timeLeft;
    }, [endTime, onEnd]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const isEnded = Object.values(timeLeft).every(v => v === 0);

    if (isEnded) {
        return <div className="font-bold text-xl sm:text-2xl text-red-400">Event has started!</div>;
    }

    return (
        <div className="flex items-center gap-2 md:gap-3">
            {Object.entries(timeLeft).map(([interval, value]) => (
                <div key={interval} className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-md min-w-[48px] text-center">
                        <div className="font-bold text-lg sm:text-xl">{String(value).padStart(2, '0')}</div>
                        <div className="text-xs capitalize">{interval}</div>
                    </div>
                    {interval !== 'seconds' && <span className="text-lg sm:text-xl font-bold">:</span>}
                </div>
            ))}
        </div>
    );
};


const HighlightEvent: React.FC<{ event: (WeeklyDiscordEvent & { project?: Project }) | null }> = ({ event }) => {
    if (!event) {
        return (
            <div className="neu-inset-panel mb-8 p-6 sm:p-8 rounded-2xl text-center">
                <h2 className="text-2xl font-display font-bold text-on-surface">No Highlight Event This Week</h2>
                <p className="text-lg text-on-surface-variant mt-2">Check back later for exciting upcoming events!</p>
            </div>
        );
    }
    
    const typeConfig = eventTypeConfig[event.type];
    
    return (
        <div className="neu-outset-card mb-8 rounded-2xl relative overflow-hidden text-white p-6 sm:p-8 min-h-[300px] flex flex-col justify-end">
            <img src={event.project?.banner || event.project?.logo || "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
            
            <div className="relative z-20">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    {/* Left Side: Details */}
                    <div className="text-left">
                        <div className={`flex items-center gap-2 text-sm font-bold px-2 py-1 rounded-full ${typeConfig.color} mb-2 w-fit`}>
                            {typeConfig.icon}
                            <span>{typeConfig.label}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white drop-shadow-lg">
                            {event.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            {event.project && <img src={event.project.logo} alt={event.project.name} className="w-8 h-8 rounded-full" />}
                            <h2 className="text-xl font-semibold text-white/90">{event.project?.name || event.serverName}</h2>
                        </div>
                    </div>
                    {/* Right Side: Countdown & Action */}
                    <div className="flex flex-col items-start md:items-end gap-3">
                        <CountdownTimer endTime={event.dateTime} />
                        <a href={event.discordEventLink} target="_blank" rel="noopener noreferrer" className="neu-button active px-6 py-2 text-base font-bold flex items-center gap-2">
                            Join Event <ChevronRight size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Reusable Inner Components ---

const EventStrip: React.FC<{ event: WeeklyDiscordEvent & { project?: Project } }> = ({ event }) => {
    const time = new Date(event.dateTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const typeConfig = eventTypeConfig[event.type];

    return (
        <div className="neu-outset-card p-3 flex items-center gap-4 w-full">
            {/* Time */}
            <div className="text-center w-20 flex-shrink-0">
                <p className="font-bold text-lg text-primary">{time}</p>
            </div>
            
            {/* Icons */}
            <div className="flex items-center -space-x-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center ${typeConfig.color} z-10 neu-shadow-outset-xs`}>
                    {typeConfig.icon}
                </div>
                {event.project && (
                     <img src={event.project.logo} alt={event.project.name} className="w-8 h-8 rounded-full bg-surface neu-shadow-outset-xs" />
                )}
            </div>

            {/* Event Details */}
            <div className="flex-grow min-w-0">
                <h4 className="font-bold text-on-surface text-base truncate">{event.name}</h4>
                 <p className="text-sm text-on-surface-variant truncate">{event.project?.name || event.serverName}</p>
            </div>
            
            {/* Action Button */}
            <a href={event.discordEventLink} target="_blank" rel="noopener noreferrer" className="neu-button active px-4 py-2 text-sm font-semibold flex-shrink-0">
                Join Event
            </a>
        </div>
    );
};


// --- Main Page Component ---
const ThisWeekPage: React.FC = () => {
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0); // 0 for current week, 1 for next, etc.
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { projectsByName } = useMemo(() => {
        const projects = getProjects();
        const projectMap = new Map<string, Project>();
        projects.forEach(p => { projectMap.set(p.name, p); });
        return { projectsByName: projectMap };
    }, []);

    const weekData = useMemo(() => {
        const events = getWeeklyDiscordEvents();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + weekOffset * 7);
        startDate.setHours(0, 0, 0, 0);

        const days = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const isToday = weekOffset === 0 && new Date().toDateString() === date.toDateString();
            return {
                date,
                isToday,
                dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase(),
                dateNum: date.getDate(),
                dateString: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                events: [] as (WeeklyDiscordEvent & { project?: Project })[],
            };
        });

        events.forEach(event => {
            const eventDate = new Date(event.dateTime);
            eventDate.setHours(0,0,0,0);
            const diffDays = Math.floor((eventDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 7) {
                const project = projectsByName.get(event.serverName) || projectsByName.get(event.partnerServerName || '');
                days[diffDays].events.push({ ...event, project });
            }
        });

        days.forEach(day => { day.events.sort((a, b) => a.dateTime - b.dateTime); });
        return days;
    }, [projectsByName, weekOffset]);

    const highlightEvent = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const currentWeekEvents = getWeeklyDiscordEvents()
            .filter(e => e.dateTime >= today.getTime() && e.dateTime <= endOfWeek.getTime())
            .map(event => {
                const project = projectsByName.get(event.serverName) || projectsByName.get(event.partnerServerName || '');
                return { ...event, project };
            });

        if (currentWeekEvents.length === 0) return null;
        
        const mintEvent = currentWeekEvents.find(e => e.type === 'mint');
        if (mintEvent) return mintEvent;
        
        const crownedEvent = currentWeekEvents.find(e => e.project && isCrowned(e.project));
        if (crownedEvent) return crownedEvent;
        
        return currentWeekEvents[0];
    }, [projectsByName]);

    const scrollToDay = (index: number) => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollTo({ left: index * container.offsetWidth, behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const newIndex = Math.round(container.scrollLeft / container.offsetWidth);
            if (newIndex !== activeDayIndex) setActiveDayIndex(newIndex);
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeDayIndex]);

    const DayColumn: React.FC<{ day: typeof weekData[0], gradient: string }> = ({ day, gradient }) => (
        <div className={`rounded-lg p-6 md:py-10 bg-gradient-to-br ${gradient}`}>
            <h3 className="font-display font-bold text-2xl text-on-surface mb-6">{day.dateString}</h3>
            {day.events.length > 0 ? (
                <div className="space-y-3">
                    {day.events.map(event => <EventStrip key={event.id} event={event} />)}
                </div>
            ) : (
                <div className="text-center py-12 text-on-surface-variant font-semibold">No events scheduled.</div>
            )}
        </div>
    );

    const weekRangeString = useMemo(() => {
        const start = weekData[0].date;
        const end = weekData[6].date;
        return `${start.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-us', { month: 'short', day: 'numeric' })}`;
    }, [weekData]);

    return (
        <div className="space-y-8">
            <HighlightEvent event={highlightEvent} />

            <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-[84rem] mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                     <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-display font-bold text-on-surface">Weekly Calendar</h2>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setWeekOffset(prev => prev - 1)} className="neu-button px-3 py-1 text-sm" disabled={weekOffset === 0}>
                                Prev Week
                            </button>
                             <button onClick={() => setWeekOffset(prev => prev + 1)} className="neu-button px-3 py-1 text-sm">
                                Next Week
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 self-end sm:self-center">
                        <button onClick={() => scrollToDay(Math.max(0, activeDayIndex - 1))} className="neu-control p-2 disabled:opacity-50" disabled={activeDayIndex === 0}><ChevronLeft /></button>
                        <button onClick={() => scrollToDay(Math.min(weekData.length - 1, activeDayIndex + 1))} className="neu-control p-2 disabled:opacity-50" disabled={activeDayIndex === weekData.length - 1}><ChevronRight /></button>
                    </div>
                </div>
                 <p className="text-center font-bold text-lg text-on-surface-variant mb-4">{weekRangeString}</p>

                <div className="flex justify-center gap-2 my-10 overflow-x-auto hide-scrollbar py-2">
                    {weekData.map((day, index) => (
                        <button key={index} onClick={() => scrollToDay(index)} className={`neu-tab-button flex-shrink-0 py-3 ${activeDayIndex === index ? 'active' : ''}`}>
                            {day.isToday ? 'Today' : day.dayName} <span className="ml-2 font-mono">{day.dateNum}</span>
                        </button>
                    ))}
                </div>
                
                <div className="neu-inset-panel mt-4">
                    <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -m-4">
                        {weekData.map((day, index) => (
                            <motion.div
                                key={day.dateString}
                                className="w-full flex-shrink-0 snap-center p-4"
                                style={{ minWidth: '100%' }}
                            >
                                <DayColumn day={day} gradient={dayGradients[index % dayGradients.length]} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThisWeekPage;