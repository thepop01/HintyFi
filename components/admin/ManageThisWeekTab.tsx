import React, { useState, useMemo, useEffect } from 'react';
import { WeeklyDiscordEvent, Project } from '../../src/types';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { useToast } from '../../context/ToastContext';
import { addOrUpdateWeeklyDiscordEvent, deleteItem, getWeeklyDiscordEvents } from '../../src/services/dataService';
import { uid } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import ImageUploadInput from '../common/ImageUploadInput';
import ConfirmationModal from '../common/ConfirmationModal';

// Form Component
const EventForm: React.FC<{
    eventToEdit: Partial<WeeklyDiscordEvent> | null;
    onSave: (event: WeeklyDiscordEvent) => void;
    onClose: () => void;
    allProjects: Project[];
}> = ({ eventToEdit, onSave, onClose, allProjects }) => {
    const [formData, setFormData] = useState<Partial<WeeklyDiscordEvent>>(eventToEdit || { type: 'community' });

    useEffect(() => {
        setFormData(eventToEdit || { type: 'community' });
    }, [eventToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, dateTime: new Date(e.target.value).getTime() }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.serverName || !formData.type || !formData.discordEventLink) {
            alert('Please fill out Name, Link, Project, and Type.');
            return;
        }
        onSave({
            id: formData.id || uid(),
            ...formData,
        } as WeeklyDiscordEvent);
    };

    const toDateTimeLocal = (timestamp: number | undefined) => {
        if (!timestamp) return '';
        return new Date(timestamp - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    return (
        <div className="neu-card p-4 my-4">
            <h3 className="text-xl font-display font-bold text-on-surface mb-4">{eventToEdit?.id ? 'Edit Event' : 'Add New Event'}</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Event Name" className="neu-inset-input w-full" />
                <input name="discordEventLink" value={formData.discordEventLink || ''} onChange={handleChange} placeholder="Discord Event Link" className="neu-inset-input w-full" />
                <input type="datetime-local" value={toDateTimeLocal(formData.dateTime)} onChange={handleDateChange} className="neu-inset-input w-full" />
                <ImageUploadInput value={formData.image || ''} onChange={val => setFormData(p => ({ ...p, image: val }))} />
                <select name="serverName" value={formData.serverName || ''} onChange={handleChange} className="neu-inset-input neu-select w-full">
                    <option value="">Select Project...</option>
                    {allProjects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <select name="type" value={formData.type || ''} onChange={handleChange} className="neu-inset-input neu-select w-full">
                    <option value="">Select Type...</option>
                    <option value="gaming">Gaming</option>
                    <option value="community">Community</option>
                    <option value="mint">Mint</option>
                    <option value="ama">AMA</option>
                    <option value="creative">Creative</option>
                    <option value="other">Other</option>
                </select>
                {formData.type === 'other' && (
                    <input name="customTypeLabel" value={formData.customTypeLabel || ''} onChange={handleChange} placeholder="Custom Type Label" className="neu-inset-input w-full" />
                )}
                <textarea name="reward" value={formData.reward || ''} onChange={handleChange} placeholder="Reward details..." className="neu-inset-input w-full" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border/20">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold"><X size={16} /></button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save</button>
            </div>
        </div>
    );
};


// Main Component
const ManageThisWeekTab: React.FC = () => {
    const { allProjects, refreshData, dataVersion } = useSuperAdminContext();
    const { addToast } = useToast();

    const [events, setEvents] = useState<WeeklyDiscordEvent[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingEvent, setEditingEvent] = useState<WeeklyDiscordEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<WeeklyDiscordEvent | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsData = await getWeeklyDiscordEvents();
            setEvents(eventsData);
        };
        fetchEvents();
    }, [dataVersion]);

    const handleSave = async (event: WeeklyDiscordEvent) => {
        if (await addOrUpdateWeeklyDiscordEvent(event)) {
            addToast('Event saved!', 'success');
            refreshData();
            setIsCreating(false);
            setEditingEvent(null);
        } else {
            addToast('Failed to save event.', 'error');
        }
    };

    const handleDelete = (event: WeeklyDiscordEvent) => {
        setEventToDelete(event);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        if (await deleteItem('weekly_discord_events', eventToDelete.id)) {
            addToast('Event deleted.', 'success');
            refreshData();
        } else {
            addToast('Failed to delete event.', 'error');
        }
        setEventToDelete(null);
    };

    const handleEdit = (event: WeeklyDiscordEvent) => {
        setEditingEvent(event);
        setIsCreating(false);
    };

    const closeForms = () => {
        setIsCreating(false);
        setEditingEvent(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage This Week's Events</h2>
                <button onClick={() => { setIsCreating(true); setEditingEvent(null); }} className="neu-button active px-4 py-2 flex items-center gap-2">
                    <Plus size={18} /> Add Event
                </button>
            </div>
            <AnimatePresence>
                {(isCreating || editingEvent) && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <EventForm
                            eventToEdit={editingEvent}
                            onSave={handleSave}
                            onClose={closeForms}
                            allProjects={allProjects}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="neu-card p-4 space-y-2">
                {events.map(event => (
                    <div key={event.id} className="neu-outset-card p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <img src={event.image || allProjects.find(p => p.name === event.serverName)?.logo || ''} alt={event.name} className="w-10 h-10 rounded-md object-cover bg-surface" />
                            <div>
                                <p className="font-bold">{event.name}</p>
                                <p className="text-sm text-on-surface-variant">
                                    {new Date(event.dateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} - {event.serverName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(event)} className="neu-button p-2"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(event)} className="neu-button p-2 hover:!text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && !isCreating && !editingEvent && (
                    <p className="text-center py-8 text-on-surface-variant">No events scheduled.</p>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!eventToDelete}
                onClose={() => setEventToDelete(null)}
                onConfirm={confirmDelete}
                title={`Delete "${eventToDelete?.name}"?`}
                confirmText="Delete"
            >
                This action is permanent and cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ManageThisWeekTab;