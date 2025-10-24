import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../src/services/dataService';
import ProfileWall from '../components/profile/ProfileWall';
import Achievements from '../components/profile/Achievements';
import NftHoldings from '../components/profile/NftHoldings';
import TokenHoldings from '../components/profile/TokenHoldings';

const ProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user');

    const user = useMemo(() => {
        const allUsers = getUsers();
        // If a user ID is in the URL, find that user
        if (userId) {
            return allUsers.find(u => u.id === userId);
        }
        // Otherwise, if a user is logged in, show their profile
        if (currentUser) {
            // make sure we get the full user object from our "DB"
            return allUsers.find(u => u.id === currentUser.id) || currentUser;
        }
        // As a fallback, show the first user (alice)
        return allUsers.find(u => u.id === 'u_1'); 
    }, [userId, currentUser]);

    if (!user) {
        return <div className="text-center py-10 text-on-background-variant">User not found.</div>;
    }

    return (
        <div>
            <div className="neu-inset-panel p-4 sm:p-6 lg:p-8">
                <ProfileWall user={user} />
            </div>
            <div className="my-12 px-4 max-w-[84rem] mx-auto space-y-12">
                <Achievements user={user} />
                <NftHoldings user={user} />
                <TokenHoldings user={user} />
            </div>
        </div>
    );
};

export default ProfilePage;