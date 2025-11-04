import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { Quest } from '../../src/types';
import QuestEntryCard from './QuestEntryCard';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, MessageSquare, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

interface WeeklyQuestProps {
  quest: Quest;
  onSubmit: (questId: string, twitterLink: string) => void;
  onVote: (questId: string, entryId: string) => void;
  onSubmitIdentityAnswer: (questId: string, answer: string) => void;
  onSubmitMultipleChoiceAnswer: (questId: string, answerIndex: number) => void;
  isDetailPage?: boolean;
}

const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 md:gap-4 text-on-surface">
      <Clock size={24} className="text-primary" />
      <div className="flex items-center gap-2 text-center">
        {Object.entries(timeLeft).map(([interval, value]) => (
          <div key={interval} className="flex items-center gap-2">
            <div className="quest-countdown-item p-2 rounded-md min-w-[48px]">
              <div className="font-bold text-xl">{String(value).padStart(2, '0')}</div>
              <div className="text-xs capitalize text-on-surface-variant">{interval}</div>
            </div>
            {interval !== 'seconds' && <span className="text-xl font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const WeeklyQuest: React.FC<WeeklyQuestProps> = ({ quest, onSubmit, onVote, onSubmitIdentityAnswer, onSubmitMultipleChoiceAnswer, isDetailPage = false }) => {
  const [twitterLink, setTwitterLink] = useState('');
  const [identityAnswer, setIdentityAnswer] = useState('');
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const { currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twitterLink.trim()) {
      onSubmit(quest.id, twitterLink);
      setTwitterLink('');
    }
  };

  const handleIdentityAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identityAnswer.trim()) {
        onSubmitIdentityAnswer(quest.id, identityAnswer);
        setIdentityAnswer('');
    }
  };

  const handleMcqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMcqOption !== null) {
      onSubmitMultipleChoiceAnswer(quest.id, selectedMcqOption);
    }
  };

  const userHasEnteredMax = currentUser ? quest.entries.filter(e => e.userId === currentUser.id).length >= quest.max_submissions_per_user : false;
  const userHasAnsweredIdentity = currentUser && quest.identityQuestion ? quest.identityQuestion.answers.some(a => a.userId === currentUser.id) : false;
  const userMcqAnswer = currentUser && quest.multipleChoiceQuestion ? quest.multipleChoiceQuestion.answers.find(a => a.userId === currentUser.id) : undefined;

  const sortedEntries = [...quest.entries].sort((a, b) => b.votes - a.votes);
  
  const ctaText = quest.status === 'ongoing' ? `View Quest` : `View Past Quest`;

  return (
    <div className="neu-card p-4 md:p-6 space-y-6">
      {/* Top section: Status and Countdown */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full font-semibold text-sm capitalize">{quest.status} Quest</span>
        </div>
        {quest.status === 'ongoing' && <CountdownTimer endTime={quest.endTime} />}
        {quest.status === 'past' && <p className="text-xl font-bold text-on-surface-variant">Quest has ended.</p>}
      </div>

      {/* Section 1: Highlight Submission */}
      <div className="p-4 bg-surface/50 rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold text-sm capitalize">{quest.category}</span>
           {isDetailPage ? (
              <h3 className="text-2xl font-bold font-display text-on-surface hover:text-primary hover:drop-shadow-[0_0_8px_rgb(var(--color-primary)/0.6)] transition-all duration-300 cursor-default">{quest.title}</h3>
            ) : (
              <ReactRouterDOM.Link to={`/quest/${quest.id}`} aria-label={`View details for ${quest.title}`}>
                  <h3 className="text-2xl font-bold font-display text-on-surface hover:text-primary hover:drop-shadow-[0_0_8px_rgb(var(--color-primary)/0.6)] transition-all duration-300">{quest.title}</h3>
              </ReactRouterDOM.Link>
            )}
        </div>
        
        {quest.status === 'ongoing' && (
          <div>
            {currentUser ? (
              userHasEnteredMax ? (
                <p className="text-center text-on-surface-variant">You have reached the maximum number of submissions for this quest.</p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                    placeholder="https://x.com/username/status/123..."
                    className="w-full px-4 py-2 rounded-lg bg-surface border border-border/20 focus:ring-primary focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
                    required
                  />
                  <button type="submit" className="neu-button active w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2">
                    <Send size={18} />
                    <span>Submit</span>
                  </button>
                </form>
              )
            ) : (
              <p className="text-center text-on-surface-variant">Connect your wallet to submit an entry.</p>
            )}
          </div>
        )}
        
        {isDetailPage ? (
          <>
              <div className="quest-entry-grid">
                  <AnimatePresence>
                      {sortedEntries.map(entry => (
                          <motion.div
                              key={entry.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          >
                              <QuestEntryCard 
                                  entry={entry}
                                  onVote={() => onVote(quest.id, entry.id)}
                                  canVote={quest.status === 'ongoing'}
                              />
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
              {quest.entries.length === 0 && (
                  <p className="text-center py-8 text-on-surface-variant">No entries submitted yet. Be the first!</p>
              )}
          </>
        ) : (
          <div className="text-center pt-4 border-t border-border/10">
              <ReactRouterDOM.Link
                  to={`/quest/${quest.id}`}
                  className="neu-button active px-6 py-2 font-bold text-lg inline-flex items-center gap-2"
              >
                  {ctaText}
              </ReactRouterDOM.Link>
          </div>
        )}
      </div>

      {quest.identityQuestion && (
        <div className="p-4 bg-surface/50 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
                <MessageSquare size={24} className="text-accent flex-shrink-0" />
                <div>
                    <h3 className="text-2xl font-bold font-display text-on-surface">{quest.identityQuestion.title}</h3>
                    <h4 className="text-xl font-semibold font-display text-on-surface-variant">{quest.identityQuestion.prompt}</h4>
                </div>
            </div>
            {quest.status === 'ongoing' && (
                <div>
                    {currentUser ? (
                        userHasAnsweredIdentity ? (
                            <p className="text-center font-semibold text-accent p-4 bg-accent/10 rounded-lg">Thanks for your answer!</p>
                        ) : (
                            <form onSubmit={handleIdentityAnswerSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                    type="text"
                                    value={identityAnswer}
                                    onChange={(e) => setIdentityAnswer(e.target.value)}
                                    placeholder="Your answer..."
                                    className="w-full px-4 py-2 rounded-lg bg-surface border border-border/20 focus:ring-accent focus:border-accent text-on-surface placeholder:text-on-surface-variant/50"
                                    required
                                />
                                <button type="submit" className="neu-button active w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 !border-accent/50 !shadow-[inset_3px_3px_6px_rgba(0,0,0,0.8),_0_0_12px_rgb(var(--color-accent)/0.6)] !text-accent">
                                    <Send size={18} />
                                    <span>Submit Answer</span>
                                </button>
                            </form>
                        )
                    ) : (
                        <p className="text-center text-on-surface-variant p-4 bg-surface/50 rounded-lg">Connect your wallet to answer the question.</p>
                    )}
                </div>
            )}
            
            {(quest.status === 'past' || userHasAnsweredIdentity) && quest.identityQuestion.answers && quest.identityQuestion.answers.length > 0 && (
                <div className="pt-4 border-t border-border/10">
                    <h5 className="font-bold text-on-surface-variant mb-2 text-lg">Community Answers:</h5>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {quest.identityQuestion.answers.map(ans => (
                            <div key={ans.id} className="p-3 bg-surface rounded-md">
                                <ReactRouterDOM.Link to={`/profile/${ans.userId}`} className="font-bold text-on-surface hover:underline">{ans.username}</ReactRouterDOM.Link>
                                <span className="text-on-surface-variant">: {ans.answer}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {quest.multipleChoiceQuestion && (
        <div className="p-4 bg-surface/50 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-accent flex-shrink-0" />
                <div>
                    <h3 className="text-2xl font-bold font-display text-on-surface">{quest.multipleChoiceQuestion.title}</h3>
                    <h4 className="text-xl font-semibold font-display text-on-surface-variant">{quest.multipleChoiceQuestion.prompt}</h4>
                </div>
            </div>

            {quest.status === 'ongoing' && (
                <div>
                    {!currentUser ? (
                         <p className="text-center text-on-surface-variant p-4 bg-surface/50 rounded-lg">Connect your wallet to answer.</p>
                    ) : userMcqAnswer ? (
                        <div className="text-center font-semibold text-accent p-4 bg-accent/10 rounded-lg">
                            <p>You answered: "{quest.multipleChoiceQuestion.options[userMcqAnswer.answerIndex]}"</p>
                        </div>
                    ) : (
                        <form onSubmit={handleMcqSubmit} className="space-y-3">
                            <div className="space-y-2">
                                {quest.multipleChoiceQuestion.options.map((option, index) => (
                                    <label key={index} className={`neu-outset-card p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedMcqOption === index ? '!shadow-inset-lg bg-accent/10' : ''}`}>
                                        <input
                                            type="radio"
                                            name="mcq-option"
                                            value={index}
                                            checked={selectedMcqOption === index}
                                            onChange={() => setSelectedMcqOption(index)}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selectedMcqOption === index ? 'border-accent bg-accent' : 'border-on-surface-variant bg-surface'}`} />
                                        <span className="font-medium text-on-surface">{option}</span>
                                    </label>
                                ))}
                            </div>
                            <button type="submit" disabled={selectedMcqOption === null} className="neu-button active w-full flex items-center justify-center gap-2 px-6 py-2 !border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Send size={18} />
                                <span>Submit Answer</span>
                            </button>
                        </form>
                    )}
                </div>
            )}
            
            {quest.status === 'past' && (
                <div className="space-y-3 pt-4 border-t border-border/10">
                     <h5 className="font-bold text-on-surface-variant text-lg">Results:</h5>
                     {quest.multipleChoiceQuestion.options.map((option, index) => {
                        const isCorrect = index === quest.multipleChoiceQuestion.correctAnswerIndex;
                        const isUserAnswer = userMcqAnswer?.answerIndex === index;
                        let Icon = null;
                        let style = "border-transparent";

                        if (isCorrect) {
                            Icon = <CheckCircle size={20} className="text-green-500" />;
                            style = "border-green-500/50 bg-green-500/10";
                        } else if (isUserAnswer) {
                            Icon = <XCircle size={20} className="text-red-500" />;
                            style = "border-red-500/50 bg-red-500/10";
                        }

                        return (
                             <div key={index} className={`neu-inset-card p-3 flex items-center gap-3 border-2 ${style}`}>
                                {Icon && <div className="flex-shrink-0">{Icon}</div>}
                                <span className="font-medium text-on-surface flex-grow">{option}</span>
                                {isUserAnswer && <span className="text-xs font-bold text-on-surface-variant px-2 py-1 bg-surface rounded-full">Your Answer</span>}
                            </div>
                        );
                     })}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default WeeklyQuest;
