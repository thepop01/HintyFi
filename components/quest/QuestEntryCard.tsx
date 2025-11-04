import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { QuestEntry } from '../../src/types';
import { useAuth } from '../../context/AuthContext';
import { ThumbsUp } from 'lucide-react';

interface QuestEntryCardProps {
  entry: QuestEntry;
  onVote: () => void;
  canVote: boolean;
}

const QuestEntryCard: React.FC<QuestEntryCardProps> = ({ entry, onVote, canVote }) => {
  const { currentUser } = useAuth();
  const hasVoted = currentUser && entry.voters.includes(currentUser.id);
  
  const prevVotedRef = useRef(hasVoted);
  const [animateVote, setAnimateVote] = useState(false);

  useEffect(() => {
    if (prevVotedRef.current !== hasVoted && hasVoted) {
      setAnimateVote(true);
    }
    prevVotedRef.current = hasVoted;
  }, [hasVoted]);

  const buttonVariants: Variants = {
    voted: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    idle: { scale: 1, rotate: 0 },
  };

  return (
    <div className="neu-outset-card quest-entry-card group">
        <img
            src={`https://picsum.photos/seed/${entry.id}/400`}
            alt={`Quest entry by ${entry.username}`}
            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center justify-between">
                <Link to={`/profile/${entry.userId}`} className="font-bold text-base hover:underline truncate" onClick={e => e.stopPropagation()}>
                    @{entry.username}
                </Link>
                <a href={entry.twitterLink} target="_blank" rel="noopener noreferrer" className="text-xs text-white/80 hover:underline" onClick={e => e.stopPropagation()}>View Post</a>
            </div>
             <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-on-primary font-semibold">Votes: {entry.votes}</p>
                {canVote && (
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onVote(); }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
                            hasVoted 
                            ? 'bg-primary/80 text-on-primary' 
                            : 'bg-surface/50 text-on-surface-variant hover:bg-primary/80 hover:text-on-primary'
                        }`}
                        aria-label={hasVoted ? 'Unvote' : 'Vote'}
                        variants={buttonVariants}
                        animate={animateVote ? "voted" : "idle"}
                        onAnimationComplete={() => setAnimateVote(false)}
                    >
                        <ThumbsUp size={14} />
                        <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                    </motion.button>
                )}
            </div>
        </div>
    </div>
  );
};

export default QuestEntryCard;