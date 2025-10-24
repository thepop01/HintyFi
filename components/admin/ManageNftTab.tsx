import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdminContext } from '../../context/SuperAdminContext';
import { Edit, Plus, ChevronRight, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';
import { addOrUpdateProject } from '../../src/services/dataService';
import { useToast } from '../../context/ToastContext';

type CollectionItem = {
    id: string;
    name: string;
    image: string;
    projectId: string;
    projectName: string;
};

const ManageNftTab: React.FC = () => {
    const { allProjects, refreshData } = useSuperAdminContext();
    const { addToast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
    const [viewMode, setViewMode] = useState<'published' | 'draft'>('published');


    const allCollections = React.useMemo(() => {
        return allProjects.flatMap(p =>
            (p.nftCollections || [])
                .filter(c => c.status === viewMode)
                .map(c => ({
                    ...c,
                    projectId: p.id,
                    projectName: p.name
                }))
        );
    }, [allProjects, viewMode]);

    const handleDeleteClick = (collection: CollectionItem) => {
        setItemToDelete(collection);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        const project = allProjects.find(p => p.id === itemToDelete.projectId);
        if (!project) {
            addToast('Parent project not found.', 'error');
            return;
        }

        const updatedCollections = project.nftCollections?.filter(c => c.id !== itemToDelete.id);
        const updatedProject = { ...project, nftCollections: updatedCollections };

        if (addOrUpdateProject(updatedProject)) {
            addToast(`Collection "${itemToDelete.name}" deleted.`, 'success');
            refreshData();
        } else {
            addToast('Failed to delete collection.', 'error');
        }

        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="neu-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-display font-bold text-on-surface">Manage NFT Collections</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(prev => prev === 'published' ? 'draft' : 'published')}
                        className="neu-button px-4 py-2"
                    >
                        {viewMode === 'published' ? 'View Drafts' : 'View Published'}
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
                {allCollections.map(collection => (
                    <div key={collection.id} className="neu-outset-card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={collection.image} alt={collection.name} className="w-10 h-10 rounded-md object-cover bg-surface" />
                            <div>
                                <p className="font-bold">{collection.name}</p>
                                <p className="text-sm text-on-surface-variant">{collection.projectName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link 
                                to={`/super-admin/nfts/edit/${collection.projectId}/${collection.id}`} 
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
                 {allCollections.length === 0 && (
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