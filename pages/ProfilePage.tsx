import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUser } from '../src/services/dataService';
import { useToast } from '../context/ToastContext';
import { User } from '../src/types';
import ProfileWall from '../components/profile/ProfileWall';
import Achievements from '../components/profile/Achievements';
import NftHoldings from '../components/profile/NftHoldings';
import TokenHoldings from '../components/profile/TokenHoldings';
import EditProfileModal from '../components/profile/EditProfileModal';

const ProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { id } = useParams();
    const { addToast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const allUsers = await getUsers();
            if (id) {
                setUser(allUsers.find(u => u.id === id) || null);
            } else if (currentUser) {
                setUser(allUsers.find(u => u.id === currentUser.id) || currentUser);
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, [id, currentUser]);
    
    const handleSaveProfile = (updatedUser: User) => {
        if (updateUser(updatedUser)) {
            addToast('Profile updated successfully!', 'success');
            setIsEditModalOpen(false);
            // The `datachanged` event from `save` in dataService will trigger a re-render
        } else {
            addToast('Failed to update profile.', 'error');
        }
    };

    if (!user) {
        return <div className="text-center py-10 text-on-background-variant">User not found.</div>;
    }
    
    const isOwnProfile = currentUser?.id === user.id;

    return (
        <div>
            <div className="neu-inset-panel p-4 sm:p-6 lg:p-8">
                <ProfileWall
                    user={user}
                    isOwnProfile={isOwnProfile}
                />
            </div>
            <div className="my-12 px-4 max-w-[84rem] mx-auto space-y-12">
                <Achievements user={user} />
                <NftHoldings user={user} />
                <TokenHoldings user={user} />
            </div>
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={user}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;