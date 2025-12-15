import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Gift, Coins, Code, Users, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface RewardSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: any;
    rewardType: string;
    cardTitle: string;
}

const RewardSuccessModal: React.FC<RewardSuccessModalProps> = ({
    isOpen,
    onClose,
    reward,
    rewardType,
    cardTitle
}) => {
    const { addToast } = useToast();

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'whitelist_fcfs':
            case 'whitelist_guaranteed':
                return <Users size={48} className="text-green-500" />;
            case 'hint_points':
                return <Coins size={48} className="text-yellow-500" />;
            case 'money':
                return <Gift size={48} className="text-emerald-500" />;
            case 'code':
                return <Code size={48} className="text-blue-500" />;
            default:
                return <Trophy size={48} className="text-purple-500" />;
        }
    };

    const getRewardTitle = (type: string) => {
        switch (type) {
            case 'whitelist_fcfs':
                return 'Whitelist Spot (FCFS)';
            case 'whitelist_guaranteed':
                return 'Guaranteed Whitelist';
            case 'hint_points':
                return 'Hint Points';
            case 'money':
                return 'Cash Reward';
            case 'code':
                return 'Access Code';
            default:
                return 'Special Reward';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            addToast('Copied to clipboard!', 'success');
        }).catch(() => {
            addToast('Failed to copy to clipboard', 'error');
        });
    };

    const renderRewardContent = () => {
        switch (rewardType) {
            case 'whitelist_fcfs':
            case 'whitelist_guaranteed':
                return (
                    <div className="text-center">
                        <p className="text-lg font-medium text-on-surface mb-4">
                            Congratulations! You've secured a whitelist spot.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 mb-2">
                                <strong>Type:</strong> {rewardType === 'whitelist_guaranteed' ? 'Guaranteed' : 'First Come First Serve'}
                            </p>
                            {reward.whitelist_spots && (
                                <p className="text-sm text-green-800">
                                    <strong>Spots:</strong> {reward.whitelist_spots}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-4">
                            Keep an eye on the project's announcements for whitelist instructions.
                        </p>
                    </div>
                );

            case 'hint_points':
                return (
                    <div className="text-center">
                        <p className="text-lg font-medium text-on-surface mb-4">
                            You've received additional hint points!
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2">
                                <Coins size={24} className="text-yellow-500" />
                                <span className="text-2xl font-bold text-yellow-600">
                                    +{reward.amount || 0}
                                </span>
                                <span className="text-lg text-yellow-600">points</span>
                            </div>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-4">
                            Use these points to open more reward cards in this or other collaborations.
                        </p>
                    </div>
                );

            case 'money':
                return (
                    <div className="text-center">
                        <p className="text-lg font-medium text-on-surface mb-4">
                            You've won a cash reward!
                        </p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2">
                                <Gift size={24} className="text-emerald-500" />
                                <span className="text-2xl font-bold text-emerald-600">
                                    ${reward.amount || 0}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-4">
                            Instructions for claiming your reward will be sent to your registered email.
                        </p>
                    </div>
                );

            case 'code':
                return (
                    <div className="text-center">
                        <p className="text-lg font-medium text-on-surface mb-4">
                            You've received an exclusive access code!
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 mb-2">Your Access Code:</p>
                            <div className="flex items-center justify-center gap-2 bg-white rounded border p-3">
                                <code className="font-mono text-lg font-bold text-blue-600">
                                    {reward.code || 'CODE-PLACEHOLDER'}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(reward.code || 'CODE-PLACEHOLDER')}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-4">
                            Save this code safely. You'll need it to access exclusive benefits.
                        </p>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <p className="text-lg font-medium text-on-surface mb-4">
                            You've received a special reward!
                        </p>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                                Check your account or email for more details about your reward.
                            </p>
                        </div>
                    </div>
                );
        }
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
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-[#faf0ff] rounded-xl shadow-2xl border border-border/10 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Celebration Animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                    initial={{
                                        x: '50%',
                                        y: '50%',
                                        scale: 0,
                                    }}
                                    animate={{
                                        x: `${Math.random() * 100}%`,
                                        y: `${Math.random() * 100}%`,
                                        scale: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.1,
                                        ease: 'easeOut',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/10">
                            <div className="flex items-center gap-3">
                                <Trophy size={24} className="text-yellow-500" />
                                <h2 className="text-lg font-display font-bold text-on-surface">
                                    Reward Unlocked!
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Reward Icon */}
                            <div className="flex justify-center mb-6">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                >
                                    {getRewardIcon(rewardType)}
                                </motion.div>
                            </div>

                            {/* Card Title */}
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-display font-bold text-on-surface mb-2">
                                    {cardTitle}
                                </h3>
                                <p className="text-sm font-medium text-primary">
                                    {getRewardTitle(rewardType)}
                                </p>
                            </div>

                            {/* Reward Content */}
                            {renderRewardContent()}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-center p-6 border-t border-border/10">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                Awesome!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RewardSuccessModal;