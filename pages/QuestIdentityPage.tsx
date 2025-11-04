import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Quest } from '../src/types';
import { getQuests, submitIdentityAnswer } from '../src/services/dataService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

const IdentityQuestDetail: React.FC<{
    quest: Quest;
    onSubmit: (questId: string, answer: string) => void;
}> = ({ quest, onSubmit }) => {
    const [identityAnswer, setIdentityAnswer] = useState('');
    const { currentUser } = useAuth();
    
    if (!quest.identityQuestion) return null;
    
    const handleIdentityAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (identityAnswer.trim()) {
            onSubmit(quest.id, identityAnswer);
            setIdentityAnswer('');
        }
    };
    
    const userHasAnsweredIdentity = currentUser ? quest.identityQuestion.answers.some(a => a.userId === currentUser.id) : false;

    return (
        <div className="neu-card p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3">
                <MessageSquare size={32} className="text-accent flex-shrink-0" />
                <div>
                    <h3 className="text-3xl font-bold font-display text-on-surface">{quest.identityQuestion.title}</h3>
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
                                <span className="font-bold text-on-surface">{ans.username}: </span>
                                <span className="text-on-surface-variant">{ans.answer}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const QuestIdentityPage: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    
    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshData = () => {
        if (id) {
            setLoading(true);
            getQuests().then(quests => {
                const foundQuest = quests.find(q => q.id === id);
                setQuest(foundQuest || null);
                setLoading(false);
            });
        }
    };
    
    useEffect(() => {
        refreshData();
    }, [id]);

    const handleIdentityAnswerSubmit = async (questId: string, answer: string) => {
        if (!currentUser) {
            addToast('Please connect your wallet to answer.', 'info');
            return;
        }
        const result = await submitIdentityAnswer(questId, currentUser.id, answer);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            refreshData();
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-on-background-variant">Loading question...</div>;
    }
    
    if (!quest || !quest.identityQuestion) {
        return (
            <div className="text-center py-10 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-on-surface">Quest question not found</h2>
                <button onClick={() => navigate('/campaigns')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} />
                    Back to Campaigns
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <ReactRouterDOM.Link to="/campaigns" className="neu-button px-4 py-2 flex items-center gap-2 w-max">
                <ArrowLeft size={16} />
                Back to Campaigns
            </ReactRouterDOM.Link>
            
            <IdentityQuestDetail
                quest={quest}
                onSubmit={handleIdentityAnswerSubmit}
            />
        </div>
    );
}

export default QuestIdentityPage;