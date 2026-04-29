import React from "react";
import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router-dom";

type PrivateRoutesProp = {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const PrivateRoutes: React.FC<PrivateRoutesProp> = ({ children, requireAdmin = false }) => {
    const { isAuth, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Caricamento...</div>;
    }

    if (!isAuth) {
        return <Navigate to='/' replace />;
    }

    
    if (requireAdmin && !isAdmin) {
        return <Navigate to='/HeyaChat' replace />;
    }

    return children;
}