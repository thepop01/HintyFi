import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Tables, User } from '../../src/types';
type CampaignEvent = Tables<'campaigns'>;
type CampaignEntry = Tables<'campaign_submissions'>;
import { Trophy, Send, Search, Heart, HeartCrack, Link, History, Loader, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { fuzzySearch } from '../../utils/helpers';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { useClickOutside } from '../../hooks/useClickOutside';
import EmptyState from '../common/EmptyState';

// --- SUBMISSION CARD COMPONENT ---

interface SubmissionCardProps {
    entry: CampaignEntry;
    onVote: (entryId: string, vote: 'up' | 'down') => void;
    currentUser: User | null;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ entry, onVote, currentUser }) => {
    const imageUrl = `https://picsum.photos/seed/${entry.id}/400/400`;
    const userVote = undefined;
    const netVotes = entry.total_votes || 0;
    const { addToast } = useToast();
    
    const prevVoteRef = useRef(userVote);
    const [animateState, setAnimateState] = useState<'idle' | 'up' | 'down'>('idle');

    useEffect(() => {
        if (prevVoteRef.current !== userVote) {
            if (userVote === 'up') {
                setAnimateState('up');
            } else if (userVote === 'down') {
                setAnimateState('down');
            }
        }
        prevVoteRef.current = userVote;
    }, [userVote]);

    const handleVoteClick = (vote: 'up' | 'down') => {
        if (!currentUser) {
            addToast('Please log in to vote.', 'info');
            return;
        }
        if (!currentUser.discordRoles?.some(role => role.name === 'with full access')) {
            addToast('You need the "with full access" role to vote.', 'warning');
            return;
        }
        onVote(entry.id, vote);
    }

    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        },
        hover: { 
            scale: 1.01,
            transition: { type: 'spring', stiffness: 300, damping: 15 }
        }
    };
    
    const iconVariants: Variants = {
        voted: { scale: [1, 1.5, 1], transition: { duration: 0.4, ease: "easeInOut" } },
        idle: { scale: 1 },
    };

    return (
        <motion.div
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            exit="hidden"
            className="card rounded-xl overflow-hidden relative shadow-lg aspect-square bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
        >
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
            
             {/* Voting UI */}
            <div className="absolute top-2 right-2 z-20 flex flex-col items-center gap-1 p-1 bg-black/40 rounded-lg backdrop-blur-sm">
                <motion.button
                    onClick={(e) => { e.stopPropagation(); handleVoteClick('up'); }}
                    className={`p-1 rounded-full transition-colors ${userVote === 'up' ? 'text-green-400' : 'text-white/70 hover:text-green-400'}`}
                    aria-label="Upvote"
                    whileTap={{ scale: 0.9 }}
                >
                     <motion.div
                        variants={iconVariants}
                        animate={animateState === 'up' ? "voted" : "idle"}
                        onAnimationComplete={() => setAnimateState('idle')}
                    >
                        <Heart size={20} className={userVote === 'up' ? 'fill-current' : ''} />
                    </motion.div>
                </motion.button>
                <span className="font-bold text-white text-sm tabular-nums">{netVotes}</span>
                <motion.button
                    onClick={(e) => { e.stopPropagation(); handleVoteClick('down'); }}
                    className={`p-1 rounded-full transition-colors ${userVote === 'down' ? 'text-red-400' : 'text-white/70 hover:text-red-400'}`}
                    aria-label="Downvote"
                    whileTap={{ scale: 0.9 }}
                >
                    <motion.div
                        variants={iconVariants}
                        animate={animateState === 'down' ? "voted" : "idle"}
                        onAnimationComplete={() => setAnimateState('idle')}
                    >
                        <HeartCrack size={20} className={userVote === 'down' ? 'fill-current' : ''} />
                    </motion.div>
                </motion.button>
            </div>
            
            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                <ReactRouterDOM.Link 
                    to={`/profile/${entry.user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-white truncate block hover:underline"
                    aria-label={`View profile of ${entry.user_id}`}
                >
                    {entry.user_id}
                </ReactRouterDOM.Link>
                <a 
                    href={entry.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-white/70 hover:underline flex items-center gap-1"
                >
                    <Link size={12} />
                    View Submission
                </a>
            </div>
        </motion.div>
    );
};

// --- MAIN DETAIL VIEW COMPONENT ---

interface CampaignDetailViewProps {
  campaign: CampaignEvent;
  submissions: CampaignEntry[];
  onVote: (entryId: string, vote: 'up' | 'down') => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ campaign, submissions, onVote }) => {
    const { currentUser } = useAuth();
    const [sortType, setSortType] = useState<'top' | 'username_asc' | 'username_desc'>('top');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { history, addSearchTerm, clearHistory } = useSearchHistory(`campaign-${campaign.id}-search`);
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    useClickOutside(searchWrapperRef, () => setIsSearchFocused(false));

    const searchSuggestions = useMemo(() => {
        if (!debouncedSearchTerm || !submissions) return [];
        return submissions
            .filter(e => fuzzySearch(debouncedSearchTerm, e.user_id))
            .slice(0, 5);
    }, [debouncedSearchTerm, submissions]);

    const handleSearchSelect = (term: string) => {
        setSearchTerm(term);
        addSearchTerm(term);
        setIsSearchFocused(false);
    };

    const handleSearchSubmit = () => {
        addSearchTerm(searchTerm);
        setIsSearchFocused(false);
    };
    
    const filteredAndSortedEntries = useMemo(() => {
        let entries: CampaignEntry[] = [...(submissions || [])];

        if (debouncedSearchTerm) {
            entries = entries.filter(entry => 
                fuzzySearch(debouncedSearchTerm, entry.user_id)
            );
        }

        entries.sort((a, b) => {
            switch (sortType) {
                case 'top':
                    return (b.total_votes || 0) - (a.total_votes || 0);
                case 'username_desc':
                    return b.user_id.localeCompare(a.user_id);
                case 'username_asc':
                default:
                    return a.user_id.localeCompare(a.user_id);
            }
        });
        
        return entries;
    }, [submissions, sortType, debouncedSearchTerm]);
  
    return (
        <div className="flex-1 flex flex-col min-h-0">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div ref={searchWrapperRef} className="relative flex-grow">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
                        <input 
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); } }}
                            className="neu-inset-control w-full pl-8 pr-4 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/70"
                        />
                        <AnimatePresence>
                            {isSearchFocused && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full mt-2 w-full bg-[rgb(var(--color-surface-container))] rounded-lg shadow-lg z-50 border border-border/10 overflow-hidden"
                            >
                                {searchTerm.length === 0 && history.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center px-3 py-2 bg-surface/50">
                                            <h4 className="text-xs font-bold text-on-surface-variant">RECENT</h4>
                                            <button onClick={clearHistory} className="text-xs text-on-surface-variant/70 hover:text-primary transition-colors">Clear</button>
                                        </div>
                                        {history.map((term) => (
                                            <button key={term} onClick={() => handleSearchSelect(term)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-primary/10 text-on-surface">
                                                <History size={16} className="text-on-surface-variant" />
                                                <span>{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchTerm.length > 0 && searchSuggestions.length > 0 && (
                                    <div>
                                        <h4 className="px-3 py-2 bg-surface/50 text-xs font-bold text-on-surface-variant">SUGGESTIONS</h4>
                                        {searchSuggestions.map((entry) => (
                                            <button key={entry.id} onClick={() => handleSearchSelect(entry.user_id)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-primary/10">
                                                <span className="text-on-surface">{entry.user_id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <select
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value as 'top' | 'username_asc' | 'username_desc')}
                        className="neu-control neu-select px-3 py-1.5 text-sm font-sans font-semibold"
                    >
                        <option value="top">Top Voted</option>
                        <option value="username_asc">Username (A-Z)</option>
                        <option value="username_desc">Username (Z-A)</option>
                    </select>
                </div>
            </div>
            {filteredAndSortedEntries.length === 0 ? (
                <EmptyState 
                    icon={<Inbox size={48} />}
                    title={searchTerm ? 'No Entries Found' : 'No Entries Yet'}
                    description={searchTerm ? `Your search for "${searchTerm}" did not match any submissions.` : 'Be the first to submit your entry to this campaign!'}
                />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredAndSortedEntries.map((entry) => {
                         return (
                            <SubmissionCard
                                key={entry.id}
                                entry={entry}
                                onVote={onVote}
                                currentUser={currentUser}
                            />
                         )
                    })}
                </div>
            )}
        </div>
    );
};

export default CampaignDetailView;