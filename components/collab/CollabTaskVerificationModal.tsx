import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { CollaborationTask as CollabTask } from '../../src/types';

interface CollabTaskVerificationModalProps {
    task: CollabTask | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

const CollabTaskVerificationModal: React.FC<CollabTaskVerificationModalProps> = ({
    task,
    isOpen,
    onClose,
    onConfirm,
    isLoading
}) => {
    if (!task) return null;

    const getVerificationUrl = () => {
        if (!task.verification_data) return null;

        switch (task.task_type) {
            case 'twitter_follow':
            case 'twitter_like':
            case 'twitter_retweet':
                return task.verification_data.twitter_username
                    ? `https://twitter.com/${task.verification_data.twitter_username}`
                    : null;
            case 'discord_join':
                return task.verification_data.discord_server_id
                    ? `https://discord.gg/${task.verification_data.discord_server_id}`
                    : null;
            case 'custom':
                return task.verification_data.custom_url || null;
            default:
                return null;
        }
    };

    const verificationUrl = getVerificationUrl();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border/10">
                            {/* Header */}
                            <div className="bg-primary/10 px-6 py-4 flex items-center justify-between border-b border-border/10">
                                <h2 className="text-xl font-display font-bold text-on-surface">Complete Task</h2>
                                <button
                                    onClick={onClose}
                                    className="text-on-surface-variant hover:text-on-surface transition-colors"
                                    disabled={isLoading}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6 space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface mb-2">{task.title}</h3>
                                    <p className="text-on-surface-variant text-sm">{task.description}</p>
                                </div>

                                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-on-surface-variant">
                                            <p className="font-medium text-on-surface mb-1">Before confirming:</p>
                                            <p>Please make sure you have completed the task. Once you confirm, you'll earn <span className="font-bold text-primary">{task.hint_points_reward} hint points</span>.</p>
                                        </div>
                                    </div>
                                </div>

                                {verificationUrl && (
                                    <a
                                        href={verificationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-3 px-4 rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                        <span>Open Task Link</span>
                                    </a>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-surface-variant/30 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-lg font-medium bg-surface hover:bg-border/20 text-on-surface transition-colors border border-border/20"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-lg font-medium bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Confirming...' : 'Confirm Completion'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CollabTaskVerificationModal;
