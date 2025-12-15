import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Coins, Loader, AlertCircle, Package } from 'lucide-react';
import { MysteryCard, UserCollaborationProgress } from '../../src/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface MysteryCardPurchaseProps {
    mysteryCard: MysteryCard | null;
    userProgress: UserCollaborationProgress | null;
    userPurchases: number; // Number of cards user has already purchased
    onPurchase: (cardId: string) => Promise<{ success: boolean; message: string }>;
    isCollabRunning: boolean;
}

const MysteryCardPurchase: React.FC<MysteryCardPurchaseProps> = ({
    mysteryCard,
    userProgress,
    userPurchases,
    onPurchase,
    isCollabRunning
}) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [isPurchasing, setIsPurchasing] = useState(false);

    if (!mysteryCard) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-border/10 p-8 text-center">
                <Package size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">No Mystery Cards Available</h3>
                <p className="text-gray-500">This collaboration doesn't have mystery cards yet.</p>
            </div>
        );
    }

    const userHintPoints = userProgress?.earned_hint_points || 0;
    const canAfford = userHintPoints >= mysteryCard.hint_points_cost;
    const hasReachedLimit = userPurchases >= mysteryCard.max_cards_per_user;
    const canPurchase = isCollabRunning && mysteryCard.can_purchase && canAfford && !hasReachedLimit;

    const handlePurchase = async () => {
        if (!currentUser) {
            addToast('Please connect your wallet to buy mystery cards.', 'info');
            return;
        }

        if (!canPurchase || hasReachedLimit) return;

        setIsPurchasing(true);
        try {
            const result = await onPurchase(mysteryCard.id);
            if (result.success) {
                addToast('Mystery card purchased successfully!', 'success');
            } else {
                addToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Error purchasing mystery card:', error);
            addToast('Failed to purchase mystery card. Please try again.', 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border/10 p-6">
            <div className="text-center mb-6">
                <div className="w-24 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Gift size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-on-surface mb-2">
                    {mysteryCard.title}
                </h3>
                <p className="text-sm text-on-surface-variant">
                    {mysteryCard.description}
                </p>
            </div>

            {/* Cost and User Limits */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Coins size={20} className="text-yellow-500" />
                        <span className="font-bold text-lg text-primary">{mysteryCard.hint_points_cost}</span>
                        <span className="text-sm text-on-surface-variant">points each</span>
                    </div>
                    <div className="text-sm text-on-surface-variant">
                        {userPurchases} / {mysteryCard.max_cards_per_user} purchased
                    </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Your balance: {userHintPoints} points</span>
                    <span>Max per user: {mysteryCard.max_cards_per_user} cards</span>
                </div>
            </div>

            {/* Purchase Status */}
            <div className="text-center">
                {!currentUser ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500 py-3">
                        <AlertCircle size={16} />
                        <span className="font-medium">Login Required</span>
                    </div>
                ) : !isCollabRunning ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500 py-3">
                        <AlertCircle size={16} />
                        <span className="font-medium">Collaboration Ended</span>
                    </div>
                ) : hasReachedLimit ? (
                    <div className="text-center py-3">
                        <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
                            <AlertCircle size={16} />
                            <span className="font-medium">Limit Reached</span>
                        </div>
                        <p className="text-xs text-orange-500">
                            You have purchased the maximum {mysteryCard.max_cards_per_user} cards allowed
                        </p>
                    </div>
                ) : !canAfford ? (
                    <div className="text-center py-3">
                        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                            <AlertCircle size={16} />
                            <span className="font-medium">Insufficient Points</span>
                        </div>
                        <p className="text-xs text-red-500">
                            You need {mysteryCard.hint_points_cost - userHintPoints} more points
                        </p>
                    </div>
                ) : (
                    <motion.button
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isPurchasing ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                <span>Buying...</span>
                            </>
                        ) : (
                            <>
                                <Gift size={20} />
                                <span>Buy Mystery Card</span>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {isCollabRunning && canPurchase && (
                <div className="mt-4 text-xs text-center text-gray-500">
                    💡 Cards can only be opened after the collaboration ends
                </div>
            )}
        </div>
    );
};

export default MysteryCardPurchase;