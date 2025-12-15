import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Coins, Trophy, Users, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { RewardCard } from '../../src/types';

interface RewardCardModalProps {
    card: RewardCard | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    userHintPoints: number;
}

const RewardCardModal: React.FC<RewardCardModalProps> = ({
    card,
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    userHintPoints
}) => {
    const [userConfirmed, setUserConfirmed] = useState(false);

    if (!card) return null;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'border-gray-400 bg-gray-50';
            case 'rare':
                return 'border-blue-400 bg-blue-50';
            case 'epic':
                return 'border-purple-400 bg-purple-50';
            case 'legendary':
                return 'border-yellow-400 bg-yellow-50';
            default:
                return 'border-gray-400 bg-gray-50';
        }
    };

    const getRarityTextColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'text-gray-600';
            case 'rare':
                return 'text-blue-600';
            case 'epic':
                return 'text-purple-600';
            case 'legendary':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRewardIcon = (rewardType: string) => {
        switch (rewardType) {
            case 'whitelist_fcfs':
            case 'whitelist_guaranteed':
                return <Users size={24} className="text-green-500" />;
            case 'hint_points':
                return <Coins size={24} className="text-yellow-500" />;
            case 'money':
                return <Gift size={24} className="text-emerald-500" />;
            case 'code':
                return <Code size={24} className="text-blue-500" />;
            default:
                return <Trophy size={24} className="text-gray-500" />;
        }
    };

    const getRewardTypeLabel = (rewardType: string) => {
        switch (rewardType) {
            case 'whitelist_fcfs':
                return 'Whitelist (First Come First Serve)';
            case 'whitelist_guaranteed':
                return 'Whitelist (Guaranteed)';
            case 'hint_points':
                return 'Hint Points';
            case 'money':
                return 'Cash Reward';
            case 'code':
                return 'Access Code';
            default:
                return rewardType;
        }
    };

    const getRewardDescription = () => {
        switch (card.reward_type) {
            case 'whitelist_fcfs':
                return `Get access to a first-come-first-serve whitelist spot. ${card.reward_data.whitelist_spots || 1} spots available.`;
            case 'whitelist_guaranteed':
                return `Get a guaranteed whitelist spot. ${card.reward_data.whitelist_spots || 1} spots available.`;
            case 'hint_points':
                return `Receive ${card.reward_data.amount || 0} additional hint points to use in other collaborations.`;
            case 'money':
                return `Receive $${card.reward_data.amount || 0} cash reward.`;
            case 'code':
                return 'Receive a unique access code for exclusive benefits.';
            default:
                return 'Special reward with exclusive benefits.';
        }
    };

    const canAfford = userHintPoints >= card.hint_points_cost;
    const isAvailable = card.claimed_count < card.total_available;

    const handleConfirm = () => {
        if (userConfirmed && canAfford && isAvailable) {
            onConfirm();
        }
    };

    const handleClose = () => {
        setUserConfirmed(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-[#faf0ff] rounded-xl shadow-2xl border border-border/10 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/10">
                            <div className="flex items-center gap-3">
                                {getRewardIcon(card.reward_type)}
                                <h2 className="text-lg font-display font-bold text-on-surface">
                                    Purchase Mystery Card
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                                disabled={isLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Card Preview */}
                            <div className={`relative rounded-xl border-2 p-4 mb-6 ${getRarityColor(card.rarity)}`}>
                                {/* Rarity Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRarityTextColor(card.rarity)} bg-white/80 capitalize`}>
                                        {card.rarity}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getRewardIcon(card.reward_type)}
                                        <h3 className="font-display font-bold text-on-surface">{card.title}</h3>
                                    </div>

                                    <p className="text-sm text-on-surface-variant mb-4">
                                        {card.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Coins size={14} className="text-yellow-500" />
                                            <span className="font-bold text-primary">{card.hint_points_cost}</span>
                                            <span className="text-sm text-on-surface-variant">points</span>
                                        </div>
                                        <div className="text-sm text-on-surface-variant">
                                            {card.total_available - card.claimed_count} / {card.total_available} left
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reward Details */}
                            <div className="mb-6">
                                <h4 className="font-medium text-on-surface mb-2">Reward Details</h4>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getRewardIcon(card.reward_type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-800 mb-1">
                                                {getRewardTypeLabel(card.reward_type)}
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                {getRewardDescription()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cost and Balance */}
                            <div className="mb-6">
                                <h4 className="font-medium text-on-surface mb-2">Cost & Balance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm text-on-surface-variant mb-1">Cost</p>
                                        <div className="flex items-center gap-1">
                                            <Coins size={16} className="text-yellow-500" />
                                            <span className="font-bold text-on-surface">{card.hint_points_cost}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm text-on-surface-variant mb-1">Your Balance</p>
                                        <div className="flex items-center gap-1">
                                            <Coins size={16} className="text-yellow-500" />
                                            <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                                                {userHintPoints}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warnings and Confirmations */}
                            {!canAfford && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-red-800">
                                            You don't have enough hint points to open this card. 
                                            You need {card.hint_points_cost - userHintPoints} more points.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!isAvailable && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-red-800">
                                            This reward card is no longer available. All copies have been claimed.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {canAfford && isAvailable && (
                                <>
                                    {/* Confirmation Checkbox */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <input
                                            type="checkbox"
                                            id="reward-confirmation"
                                            checked={userConfirmed}
                                            onChange={(e) => setUserConfirmed(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="reward-confirmation" className="text-sm text-on-surface">
                                            I confirm that I want to spend {card.hint_points_cost} hint points to purchase this mystery card.
                                        </label>
                                    </div>

                                    {/* Warning */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-yellow-800">
                                                This action cannot be undone. The hint points will be deducted immediately. You can open the card to reveal your reward after the collaboration ends.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/10">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!userConfirmed || !canAfford || !isAvailable || isLoading}
                                className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                <span>{isLoading ? 'Purchasing...' : 'Confirm Purchase'}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RewardCardModal;