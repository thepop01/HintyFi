

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Project } from '../../src/types';
import { Heart, HeartCrack } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { canVote } from '../../utils/helpers';

interface SentimentVoteControlProps {
    project: Project;
    onVote: (projectId: string, vote: 'up' | 'down') => void;
}

const SentimentVoteControl: React.FC<SentimentVoteControlProps> = ({ project, onVote }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const userVote = project.votes.voters.find(v => v.userId === currentUser?.id)?.vote;
    const hasUpvoted = userVote === 'up';
    const hasDownvoted = userVote === 'down';

    const prevVoteRef = useRef(userVote);
    const [animateState, setAnimateState] = useState<'idle' | 'up' | 'down'>('idle');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    useEffect(() => {
        if (prevVoteRef.current !== userVote) {
            if (userVote === 'up') setAnimateState('up');
            else if (userVote === 'down') setAnimateState('down');
        }
        prevVoteRef.current = userVote;
    }, [userVote]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            addToast('Please connect your wallet to vote.', 'info');
            return;
        }
        const voteCheck = canVote(currentUser);
        if (!voteCheck.canVote) {
            addToast(voteCheck.reason, 'error');
            return;
        }
        setIsOpen(prev => !prev);
    };

    const handleVoteClick = (vote: 'up' | 'down') => {
        onVote(project.id, vote);
        setIsOpen(false);
    };
    
    const iconVariants: Variants = {
        voted: { scale: [1, 1.4, 1], transition: { duration: 0.3 } },
        idle: { scale: 1 },
    };

    return (
        <div className="relative group" ref={wrapperRef}>
            <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 sm:gap-3 text-on-surface-variant p-0.5 sm:p-1.5 rounded-md hover:bg-surface/50 transition-colors w-full justify-center"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <motion.div
                    className={`flex items-center gap-0.5 sm:gap-1 transition-colors ${hasUpvoted ? 'text-green-400' : 'hover:text-green-400'}`}
                    variants={iconVariants}
                    animate={animateState === 'up' ? "voted" : "idle"}
                    onAnimationComplete={() => setAnimateState('idle')}
                >
                    <Heart size={13} className={`sm:w-4 sm:h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                    <span className="font-semibold text-xs sm:text-xs md:text-sm">{project.votes.up}</span>
                </motion.div>
                <motion.div
                    className={`flex items-center gap-0.5 sm:gap-1 transition-colors ${hasDownvoted ? 'text-red-400' : 'hover:text-red-400'}`}
                    variants={iconVariants}
                    animate={animateState === 'down' ? "voted" : "idle"}
                    onAnimationComplete={() => setAnimateState('idle')}
                >
                    <HeartCrack size={13} className={`sm:w-4 sm:h-4 ${hasDownvoted ? 'fill-current' : ''}`} />
                    <span className="font-semibold text-xs sm:text-xs md:text-sm">{project.votes.down}</span>
                </motion.div>
            </button>

            <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none mr-2 hidden sm:block">
                <div className="bg-background-alt text-on-surface text-xs rounded-md shadow-lg p-2 max-w-xs text-wrap">
                    Have "full access" in Monad or 50 Hint Points to vote.
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 w-max card p-2 flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => handleVoteClick('up')}
                            className={`p-1 sm:p-1.5 rounded-full transition-colors ${hasUpvoted ? 'bg-green-500/20 text-green-400' : 'hover:bg-green-500/10 text-on-surface-variant hover:text-green-400'}`}
                            aria-label="Vote up"
                        >
                            <Heart size={13} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => handleVoteClick('down')}
                            className={`p-1 sm:p-1.5 rounded-full transition-colors ${hasDownvoted ? 'bg-red-500/20 text-red-400' : 'hover:bg-red-500/10 text-on-surface-variant hover:text-red-400'}`}
                            aria-label="Vote down"
                        >
                            <HeartCrack size={13} className="sm:w-4 sm:h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SentimentVoteControl;