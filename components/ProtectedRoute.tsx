/**
 * =================================================================
 * 🔐 ProtectedRoute - Bảo vệ route yêu cầu đăng nhập
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Chỉ cho phép truy cập nếu người dùng đã đăng nhập.
 * - Nếu chưa đăng nhập → chuyển hướng (redirect) đến trang đăng nhập.
 *
 * CÁCH DÙNG:
 * <ProtectedRoute isAuthenticated={isLoggedIn} redirectTo="/login">
 *    <MainAppLayout />
 * </ProtectedRoute>
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    redirectTo?: string;
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, redirectTo = '/login', children }) => {
    if (!isAuthenticated) {
        // ⛔ Chưa đăng nhập → chuyển hướng về trang chỉ định (mặc định /login)
        return <Navigate to={redirectTo} replace />;
    }

    // ✅ Đã đăng nhập → render nội dung con
    return <>{children}</>;
};

