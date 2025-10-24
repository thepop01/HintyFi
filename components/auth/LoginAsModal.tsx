import React from 'react';
import Modal from '../common/Modal';
import { User } from '../../src/types';

interface LoginAsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (userId: string) => void;
    allUsers: User[];
}

const LoginAsModal: React.FC<LoginAsModalProps> = ({ isOpen, onClose, onLogin, allUsers }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log In As...">
            <div className="max-h-[60vh] overflow-y-auto">
                <ul className="space-y-2">
                    {allUsers.map(user => (
                        <li key={user.id}>
                            <button
                                onClick={() => onLogin(user.id)}
                                className="w-full text-left neu-outset-card p-3 flex items-center gap-4 transition-all"
                            >
                                <img
                                    src={user.profilePic || `https://i.pravatar.cc/40?u=${user.id}`}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-bold text-on-surface">{user.name}</p>
                                    <p className="text-sm text-on-surface-variant capitalize">
                                        {user.role.replace('_', ' ')}
                                    </p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default LoginAsModal;