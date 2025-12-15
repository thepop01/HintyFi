import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Coins, Code, Users, X, Loader, Package } from 'lucide-react';
import { UserCardPurchase, RaffleReward } from '../../src/types';
import { useToast } from '../../context/ToastContext';
import { openPurchasedCard } from '../../src/services/dataService';

interface RewardsWonDisplayProps {
    purchases: UserCardPurchase[];
    isCollabRunning: boolean;
    onCardOpened: () => void;
}

const RewardsWonDisplay: React.FC<RewardsWonDisplayProps> = ({
    purchases,
    isCollabRunning,
    onCardOpened
}) => {
    const { addToast } = useToast();
    const [openingCardId, setOpeningCardId] = useState<string | null>(null);
    const [selectedReward, setSelectedReward] = useState<RaffleReward | null>(null);

    const openedPurchases = purchases.filter(p => p.is_opened);
    const unopenedPurchases = purchases.filter(p => !p.is_opened);

    const getRewardIcon = (rewardType: string) => {
        switch (rewardType) {
            case 'whitelist':
                return <Users size={20} className="text-green-500" />;
            case 'tokens':
                return <Coins size={20} className="text-yellow-500" />;
            case 'points':
                return <Trophy size={20} className="text-blue-500" />;
            case 'code':
                return <Code size={20} className="text-purple-500" />;
            default:
                return <Gift size={20} className="text-gray-500" />;
        }
    };

    const getRewardColor = (rewardType: string) => {
        switch (rewardType) {
            case 'whitelist':
                return 'border-green-200 bg-green-50';
            case 'tokens':
                return 'border-yellow-200 bg-yellow-50';
            case 'points':
                return 'border-blue-200 bg-blue-50';
            case 'code':
                return 'border-purple-200 bg-purple-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const handleOpenCard = async (purchase: UserCardPurchase) => {
        if (isCollabRunning) {
            addToast("You can only open cards after the collaboration ends!", "info");
            return;
        }

        setOpeningCardId(purchase.id);
        try {
            const result = await openPurchasedCard(purchase.id, purchase.user_id);
            if (result.success) {
                addToast(result.message, "success");
                onCardOpened(); // Refresh data
            } else {
                addToast(result.message, "error");
            }
        } catch (error) {
            console.error("Error opening card:", error);
            addToast("Failed to open card. Please try again.", "error");
        } finally {
            setOpeningCardId(null);
        }
    };

    if (purchases.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-border/10 p-6 text-center">
                <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">No Rewards Yet</h3>
                <p className="text-gray-500">Buy and open mystery cards to see your rewards here!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Trophy className="text-primary" />
                        My Rewards
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {isCollabRunning 
                            ? "Open your cards after the collaboration ends to reveal rewards" 
                            : "Click on unopened cards to reveal your rewards!"}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{openedPurchases.length}</div>
                    <div className="text-xs text-gray-500">Rewards Won</div>
                </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Opened Cards with Rewards */}
                {openedPurchases.map((purchase, index) => {
                    const reward = purchase.reward_won;
                    return (
                        <motion.div
                            key={`opened-${purchase.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                                reward ? getRewardColor(reward.type) : 'border-gray-200 bg-gray-50'
                            }`}
                            onClick={() => reward && setSelectedReward(reward)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {reward ? getRewardIcon(reward.type) : <X size={20} className="text-gray-400" />}
                                    <span className="text-xs font-bold text-gray-600">
                                        #{index + 1}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(purchase.opened_at || purchase.purchased_at).toLocaleDateString()}
                                </div>
                            </div>

                            {reward ? (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1 text-sm">{reward.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">{reward.description}</p>
                                    {reward.value.amount && (
                                        <div className="mt-2 text-xs font-bold text-green-600">
                                            +{reward.value.amount} {reward.value.token_symbol || 'points'}
                                        </div>
                                    )}
                                    {reward.value.code && (
                                        <div className="mt-2 text-xs font-mono bg-white p-1 rounded border">
                                            {reward.value.code}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <X size={24} className="text-gray-400 mx-auto mb-1" />
                                    <div className="text-xs font-bold text-gray-500">Empty Card</div>
                                    <div className="text-xs text-gray-400">Better luck next time!</div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Unopened Cards */}
                {unopenedPurchases.map((purchase, index) => (
                    <motion.div
                        key={`unopened-${purchase.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (openedPurchases.length + index) * 0.05 }}
                        className={`border-2 rounded-xl p-4 transition-all ${
                            isCollabRunning 
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                                : 'border-purple-200 bg-purple-50 cursor-pointer hover:shadow-md hover:border-purple-300'
                        }`}
                        onClick={() => !isCollabRunning && handleOpenCard(purchase)}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Package size={20} className={isCollabRunning ? "text-gray-400" : "text-purple-500"} />
                                <span className="text-xs font-bold text-gray-600">
                                    #{openedPurchases.length + index + 1}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(purchase.purchased_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="text-center py-4">
                            {openingCardId === purchase.id ? (
                                <div>
                                    <Loader size={32} className="text-purple-500 animate-spin mx-auto mb-2" />
                                    <div className="text-sm font-bold text-purple-600">Opening...</div>
                                </div>
                            ) : isCollabRunning ? (
                                <div>
                                    <Package size={32} className="text-gray-400 mx-auto mb-2" />
                                    <div className="text-sm font-bold text-gray-500">Locked</div>
                                    <div className="text-xs text-gray-400">Available after event</div>
                                </div>
                            ) : (
                                <div>
                                    <Gift size={32} className="text-purple-500 animate-bounce mx-auto mb-2" />
                                    <div className="text-sm font-bold text-purple-600">Click to Open</div>
                                    <div className="text-xs text-purple-500">Reveal your reward!</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Reward Detail Modal */}
            {selectedReward && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {getRewardIcon(selectedReward.type)}
                                <h3 className="text-lg font-bold">{selectedReward.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedReward(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{selectedReward.description}</p>
                        
                        {selectedReward.value.amount && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <div className="font-bold text-green-800">
                                    Amount: {selectedReward.value.amount} {selectedReward.value.token_symbol || 'points'}
                                </div>
                            </div>
                        )}
                        
                        {selectedReward.value.code && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                <div className="text-sm text-gray-600 mb-1">Access Code:</div>
                                <div className="font-mono font-bold text-gray-800 bg-white p-2 rounded border">
                                    {selectedReward.value.code}
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={() => setSelectedReward(null)}
                            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default RewardsWonDisplay;