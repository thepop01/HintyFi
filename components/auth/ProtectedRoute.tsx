import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const ProtectedRoute: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    return currentUser ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;