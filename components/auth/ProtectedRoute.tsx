import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import Loader from '../common/Loader';

interface ProtectedRouteProps {
  roles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!currentUser || !roles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
