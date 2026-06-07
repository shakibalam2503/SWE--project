import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';

// Import all features/pages
import BrowseProperties from './features/properties/pages/BrowseProperties';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import PropertyDetails from './features/properties/pages/PropertyDetails';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import OwnerDashboard from './features/properties/pages/OwnerDashboard';
import OwnerProperties from './features/properties/pages/OwnerProperties';
import OwnerPayments from './features/properties/pages/OwnerPayments';
import AddPropertyWizard from './features/properties/pages/AddPropertyWizard';
import EditPropertyWizard from './features/properties/pages/EditPropertyWizard';
import SearchPage from './features/search/pages/SearchPage';
import TenantDashboard from './features/tenant/pages/TenantDashboard';
import TenantCurrentStay from './features/tenant/pages/TenantCurrentStay';
import TenantMessages from './features/chat/pages/TenantMessages';
import TenantPayments from './features/tenant/pages/TenantPayments';
import TenantRequests from './features/stayRequest/pages/TenantRequests';
import TenantVisits from './features/tenant/pages/TenantVisits';
import OwnerRequests from './features/stayRequest/pages/OwnerRequests';
import OwnerVisits from './features/properties/pages/OwnerVisits';
import AgreementsList from './features/agreement/pages/AgreementsList';
import AgreementDetails from './features/agreement/pages/AgreementDetails';

export const ROUTE_MAPS = {
  'browse': '/',
  'login': '/login',
  'signup': '/register',
  'details': '/properties/:id',
  'admindashboard': '/admin/dashboard',
  'ownerdashboard': '/owner/dashboard',
  'owner-properties': '/owner/properties',
  'owner-payments': '/owner/payments',
  'addproperty': '/owner/properties/add',
  'editproperty': '/owner/properties/edit/:id',
  'aisearch': '/search',
  'tenant-dashboard': '/tenant/dashboard',
  'tenant-stay': '/tenant/stay',
  'tenant-messages': '/tenant/messages',
  'tenant-payments': '/tenant/payments',
  'tenant-requests': '/tenant/requests',
  'tenant-visits': '/tenant/visits',
  'owner-requests': '/owner/requests',
  'owner-visits': '/owner/visits',
  'agreements': '/agreements',
  'agreement-details': '/agreements/:id'
};

export const resolvePath = (page, id = null) => {
  if (page === 'details' && id) return `/properties/${id}`;
  if (page === 'editproperty' && id) return `/owner/properties/edit/${id}`;
  if (page === 'agreement-details' && id) return `/agreements/${id}`;
  return ROUTE_MAPS[page] || '/';
};

// Wrappers for pages that require parameters from Route
const PropertyDetailsWrapper = ({ onNavigate, isLoggedIn, user }) => {
  const { id } = useParams();
  return <PropertyDetails onNavigate={onNavigate} isLoggedIn={isLoggedIn} user={user} propertyId={id} />;
};

const EditPropertyWizardWrapper = ({ onNavigate }) => {
  const { id } = useParams();
  return <EditPropertyWizard onNavigate={onNavigate} propertyId={id} />;
};

const AgreementDetailsWrapper = ({ onNavigate }) => {
  const { id } = useParams();
  return <AgreementDetails onNavigate={onNavigate} agreementId={id} />;
};

// Protected routes wrapping component
const ProtectedRoute = ({ isLoggedIn, loading, allowedRoles, user, children }) => {
  if (loading) return null;
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Public only (like Login/Register)
const PublicOnlyRoute = ({ isLoggedIn, loading, user, children }) => {
  if (loading) return null;
  if (isLoggedIn) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// Root/Browse Route component that redirects admin and owners to their respective dashboards
const BrowsePropertiesRoute = ({ isLoggedIn, user, loading, onNavigate }) => {
  if (loading) return null;
  if (isLoggedIn) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  }
  return <BrowseProperties onNavigate={onNavigate} isLoggedIn={isLoggedIn} user={user} />;
};

export default function AppRoutes({ isLoggedIn, user, loading }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Keep track of the previous location to pass as previousPage to login/signup
  const [previousPage, setPreviousPage] = useState(null);
  const prevPathRef = useRef(null);

  useEffect(() => {
    // Determine previousPage based on path
    if (prevPathRef.current) {
      if (prevPathRef.current.startsWith('/properties/')) {
        setPreviousPage('details');
      } else {
        setPreviousPage('browse');
      }
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleNavigate = (page, id = null) => {
    const path = resolvePath(page, id);
    navigate(path);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<BrowsePropertiesRoute isLoggedIn={isLoggedIn} user={user} loading={loading} onNavigate={handleNavigate} />} />
      <Route path="/search" element={<SearchPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} user={user} />} />
      <Route path="/properties/:id" element={<PropertyDetailsWrapper onNavigate={handleNavigate} isLoggedIn={isLoggedIn} user={user} />} />

      {/* Guest/Auth-only Routes */}
      <Route path="/login" element={
        <PublicOnlyRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <Login onNavigate={handleNavigate} previousPage={previousPage} />
        </PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <Register onNavigate={handleNavigate} previousPage={previousPage} />
        </PublicOnlyRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['admin']} user={user}>
          <AdminDashboard onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      {/* Protected Owner Routes */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <OwnerDashboard onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/properties" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <OwnerProperties onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/payments" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <OwnerPayments onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/properties/add" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <AddPropertyWizard onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/properties/edit/:id" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <EditPropertyWizardWrapper onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/requests" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <OwnerRequests onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/owner/visits" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['owner']} user={user}>
          <OwnerVisits onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      {/* Protected Tenant/Common Routes */}
      <Route path="/tenant/dashboard" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['tenant']} user={user}>
          <TenantDashboard onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/tenant/stay" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <TenantCurrentStay onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/tenant/messages" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <TenantMessages onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/tenant/payments" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['tenant']} user={user}>
          <TenantPayments onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/tenant/requests" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['tenant']} user={user}>
          <TenantRequests onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/tenant/visits" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} allowedRoles={['tenant']} user={user}>
          <TenantVisits onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      
      {/* Shared Protected Agreement Routes */}
      <Route path="/agreements" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <AgreementsList onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />
      <Route path="/agreements/:id" element={
        <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading} user={user}>
          <AgreementDetailsWrapper onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
