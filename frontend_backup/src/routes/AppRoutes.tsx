import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ItemListPage } from '../features/items/pages/ItemListPage';
import { ReportItemPage } from '../features/items/pages/ReportItemPage';
import { ItemDetailsPage } from '../features/items/pages/ItemDetailsPage';
import { MatchesPage } from '../features/items/pages/MatchesPage';
import { CreateClaimPage } from '../features/claims/pages/CreateClaimPage';
import { ClaimDetailsPage } from '../features/claims/pages/ClaimDetailsPage';
import { ClaimReviewPage } from '../features/claims/pages/ClaimReviewPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { AuthProvider } from '../features/auth/context/AuthContext';

import { DashboardPage } from '../features/admin/pages/DashboardPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { ClaimManagementPage } from '../features/admin/pages/ClaimManagementPage';

import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { EditProfilePage } from '../features/profile/pages/EditProfilePage';
import { ChangePasswordPage } from '../features/profile/pages/ChangePasswordPage';

import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';

import { QRItemPage } from '../features/qr/pages/QRItemPage';
import { QRScannerPage } from '../features/qr/pages/QRScannerPage';
import { QRDetailsPage } from '../features/qr/pages/QRDetailsPage';

// Placeholder components for routes that might exist in a real app
const Home = () => <div>Home Page</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

export const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/items/report" element={
          <ProtectedRoute>
            <ReportItemPage />
          </ProtectedRoute>
        } />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/matches" element={
          <ProtectedRoute>
            <MatchesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/claims/create/:itemId" element={
          <ProtectedRoute>
            <CreateClaimPage />
          </ProtectedRoute>
        } />
        <Route path="/claims/:id" element={<ClaimDetailsPage />} />
        
        <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/claims" element={<ProtectedRoute><ClaimManagementPage /></ProtectedRoute>} />
        <Route path="/admin/claims/:id" element={<ProtectedRoute><ClaimReviewPage /></ProtectedRoute>} />
        
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        
        <Route path="/qr/generate/:id" element={<ProtectedRoute><QRItemPage /></ProtectedRoute>} />
        <Route path="/qr/scan" element={<QRScannerPage />} />
        <Route path="/qr/scan/:code" element={<QRDetailsPage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};
