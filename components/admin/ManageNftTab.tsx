import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { Edit, Plus, ChevronRight, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';
import { addOrUpdateNft, deleteItem, getNfts } from '../../src/services/dataService';
import { useToast } from '../../context/ToastContext';

const ManageNftTab: React.FC = () => {
    const { refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [nfts, setNfts] = useState<any[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'draft'>('all');


    useEffect(() => {
        const fetchNfts = async () => {
            const data = await getNfts();
            setNfts(data);
        };
        fetchNfts();
    }, [refreshData]);

    const filteredNfts = React.useMemo(() => {
        if (viewMode === 'draft') {
            return nfts.filter(c => c.status === 'draft');
        }
        return nfts;
    }, [nfts, viewMode]);

    const handleDeleteClick = (collection: any) => {
        setItemToDelete(collection);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const success = await deleteItem('nfts', itemToDelete.id);
        if (success) {
            addToast(`Collection "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete collection.', 'error');
        }

        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handlePublish = async (nftToUpdate: any) => {
        const success = await addOrUpdateNft({ ...nftToUpdate, status: 'published' });
        if (success) {
            addToast(`Collection "${nftToUpdate.name}" published.`, 'success');
            refreshData();
        } else {
            addToast('Failed to publish collection.', 'error');
        }
    };

    return (
        <div className="neu-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage NFT Collections</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(prev => prev === 'all' ? 'draft' : 'all')}
                        className="neu-button px-4 py-2"
                    >
                        {viewMode === 'all' ? 'View Drafts' : 'View All'}
                    </button>
                    <Link
                        to="/super-admin/nfts/add"
                        className="neu-button active px-4 py-2 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Collection
                    </Link>
                </div>
            </div>
            <div className="space-y-3">
                {filteredNfts.map(collection => (
                    <div key={collection.id} className="neu-outset-card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={collection.image_url} alt={collection.name} className="w-10 h-10 rounded-md object-cover bg-surface" />
                            <div>
                                <p className="font-bold">{collection.name}</p>
                                <p className="text-sm text-on-surface-variant">{collection.project_id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {collection.status === 'draft' && (
                                <button onClick={() => handlePublish(collection)} className="neu-button active px-3 py-1 text-sm">
                                    Publish
                                </button>
                            )}
                            <Link 
                                to={`/super-admin/nfts/edit/${collection.id}`}
                                className="neu-button p-2"
                                title={`Manage ${collection.name}`}
                            >
                                <ChevronRight size={20} />
                            </Link>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(collection); }}
                                className="neu-button p-2 hover:!text-red-500"
                                title={`Delete ${collection.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                 {filteredNfts.length === 0 && (
                    <p className="text-center py-8 text-on-surface-variant">
                        No {viewMode} collections found.
                    </p>
                )}
            </div>
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete "${itemToDelete?.name}"?`}
                confirmText="Delete"
            >
                Are you sure you want to delete this NFT collection? This cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ManageNftTab;