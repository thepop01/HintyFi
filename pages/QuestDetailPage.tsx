import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Quest } from '../src/types';
import { getQuests, submitQuestEntry, voteQuestEntry, submitIdentityAnswer, submitMultipleChoiceAnswer } from '../src/services/dataService';
import WeeklyQuest from '../components/quest/WeeklyQuest';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

const QuestDetailPage: React.FC = () => {
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

    const handleQuestSubmit = async (questId: string, twitterLink: string) => {
        if (!currentUser) {
            addToast('Please connect your wallet to submit.', 'info');
            return;
        }
        const result = await submitQuestEntry(questId, currentUser.id, twitterLink);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            refreshData();
        }
    };

    const handleQuestVote = (questId: string, entryId: string) => {
        if (!currentUser) {
            addToast('Please connect your wallet to vote.', 'info');
            return;
        }
        const success = voteQuestEntry(questId, entryId, currentUser.id);
        if (success) {
            addToast('Vote registered!', 'success');
            refreshData();
        } else {
            addToast('Failed to register vote.', 'error');
        }
    };

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

    const handleMultipleChoiceAnswerSubmit = async (questId: string, answerIndex: number) => {
        if (!currentUser) {
            addToast('Please connect your wallet to answer.', 'info');
            return;
        }
        const result = await submitMultipleChoiceAnswer(questId, currentUser.id, answerIndex);
        addToast(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            refreshData();
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 text-on-background-variant">
                Loading quest...
            </div>
        );
    }
    
    if (!quest) {
        return (
            <div className="text-center py-10 max-w-[84rem] mx-auto">
                <h2 className="text-2xl font-bold text-on-surface">Quest not found</h2>
                <button onClick={() => navigate('/campaigns')} className="mt-4 neu-button px-4 py-2 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} />
                    Back to Campaigns
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-[84rem] mx-auto space-y-6 px-4 sm:px-6">
             <ReactRouterDOM.Link to="/campaigns" className="neu-button px-4 py-2 flex items-center gap-2 w-max">
                <ArrowLeft size={16} />
                Back to Campaigns
            </ReactRouterDOM.Link>
            
            <WeeklyQuest
                quest={quest}
                onSubmit={handleQuestSubmit}
                onVote={handleQuestVote}
                onSubmitIdentityAnswer={handleIdentityAnswerSubmit}
                onSubmitMultipleChoiceAnswer={handleMultipleChoiceAnswerSubmit}
                isDetailPage={true}
            />
        </div>
    );
}

export default QuestDetailPage;
