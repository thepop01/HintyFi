import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentManagementTab from '../../../components/admin/ContentManagementTab';
import ManageQuestsTab from '../../../components/admin/ManageQuestsTab';
import EventsCampaigns from '../../../components/admin/EventsCampaigns';
import EventsTasks from '../../../components/admin/EventsTasks';
import ManageThisWeekTab from '../../../components/admin/ManageThisWeekTab';
import { Layout, CheckSquare, Sparkles, Trophy, Calendar } from 'lucide-react';

const tabs = [
    { id: 'header', label: 'Header', icon: Layout },
    { id: 'quest', label: 'Quest', icon: Trophy },
    { id: 'campaign', label: 'Campaigns', icon: Sparkles },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'this-week', label: 'This Week', icon: Calendar },
];

const ManageEventsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('campaign');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Manage Events</h1>
                <p className="text-on-surface-variant mt-1">Manage global campaigns, tasks, quests, and header content.</p>
            </div>

            <div className="border-b border-border/10">
                <div className="flex gap-6 overflow-x-auto hide-scrollbar p-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-1 flex items-center gap-2 font-semibold transition-colors relative whitespace-nowrap ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="py-4">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'header' && <ContentManagementTab />}
                        {activeTab === 'quest' && <ManageQuestsTab />}
                        {activeTab === 'campaign' && <EventsCampaigns />}
                        {activeTab === 'task' && <EventsTasks />}
                        {activeTab === 'this-week' && <ManageThisWeekTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManageEventsPage;
