import React from 'react';
import { motion } from 'framer-motion';
import { Package, Gift, Clock, Lock } from 'lucide-react';
import { UserCardPurchase } from '../../src/types';

interface PurchasedCardsDisplayProps {
    purchases: UserCardPurchase[];
    isCollabRunning: boolean;
}

const PurchasedCardsDisplay: React.FC<PurchasedCardsDisplayProps> = ({
    purchases,
    isCollabRunning
}) => {
    const totalCards = purchases.length;
    const openedCards = purchases.filter(p => p.is_opened).length;
    const unopenedCards = totalCards - openedCards;

    if (totalCards === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-border/10 p-6 text-center">
                <Package size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">No Cards Purchased</h3>
                <p className="text-gray-500">Buy mystery cards to see them here!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">
                        <Package className="text-primary" />
                        My Mystery Cards
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {isCollabRunning 
                            ? "Cards are locked until the collaboration ends" 
                            : "The collaboration has ended! Open your cards below."}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{totalCards}</div>
                    <div className="text-xs text-gray-500">Total Cards</div>
                </div>
            </div>

            {/* Cards Grid Display */}
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-6">
                {purchases.map((purchase, index) => (
                    <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`aspect-[3/4] rounded-lg flex items-center justify-center text-white shadow-sm ${
                            purchase.is_opened 
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                : isCollabRunning
                                    ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                    : 'bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse'
                        }`}
                        title={purchase.is_opened ? 'Opened' : isCollabRunning ? 'Locked' : 'Ready to Open'}
                    >
                        {purchase.is_opened ? (
                            <Gift size={12} />
                        ) : isCollabRunning ? (
                            <Lock size={12} />
                        ) : (
                            <Gift size={12} className="animate-bounce" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        {isCollabRunning ? <Lock size={16} className="text-gray-500" /> : <Clock size={16} className="text-purple-500" />}
                        <span className="font-bold text-lg">{unopenedCards}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                        {isCollabRunning ? 'Locked Cards' : 'Ready to Open'}
                    </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Gift size={16} className="text-green-500" />
                        <span className="font-bold text-lg">{openedCards}</span>
                    </div>
                    <div className="text-xs text-gray-600">Opened Cards</div>
                </div>
            </div>

            {isCollabRunning && unopenedCards > 0 && (
                <div className="mt-4 text-center text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <Clock size={14} className="inline mr-1" />
                    Your cards will be available to open when the collaboration ends
                </div>
            )}
        </div>
    );
};

export default PurchasedCardsDisplay;