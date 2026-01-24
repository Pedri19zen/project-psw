import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import ServiceList from './components/services/ServiceList';
import ServiceForm from './components/services/ServiceForm';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';
import WorkshopSettings from './components/workshop/WorkshopSettings';
import Auth from "./pages/Auth";
import MyVehicles from "./pages/MyVehicles";
import NewBooking from "./pages/NewBooking"; 
import ClientDashboard from "./pages/ClientDashboard";
import MyBookings from "./pages/MyBookings";
import WorkshopsList from "./pages/WorkshopsList";
import WorkshopDetails from "./pages/WorkshopDetails";

// --- COMPONENTE DE PROTEÇÃO INTELIGENTE ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>; 

  // 1. Not logged in? Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in but wrong role?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* --- ROTA PÚBLICA: LOGIN --- */}
          <Route path="/login" element={<Auth />} />

          {/* --- ÁREA DE ADMINISTRAÇÃO & STAFF (Secure) --- */}
          <Route
            path="/admin"
            element={
              // --- FIX: ADDED 'mechanic' TO ALLOWED ROLES ---
              <ProtectedRoute allowedRoles={['admin', 'staff', 'mechanic']}>
                <AdminLayout /> 
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            
            <Route path="services" element={<ServiceList />} />
            <Route path="services/new" element={<ServiceForm />} />
            
            {/* Edit Route */}
            <Route path="services/:id" element={<ServiceForm />} /> 
            
            <Route path="staff" element={<StaffList />} />
            <Route path="staff/new" element={<StaffForm />} />
            <Route path="settings" element={<WorkshopSettings />} />
          </Route>

          {/* --- ROTA DE REDIRECIONAMENTO STAFF --- */}
          <Route path="/staff" element={<Navigate to="/admin/dashboard" replace />} />

          {/* --- ÁREA DO CLIENTE (Secure) --- */}
          
          <Route path="/dashboard" element={
            <ProtectedRoute> <Navbar /><ClientDashboard /> </ProtectedRoute>
          } />
          
          <Route path="/veiculos" element={
            <ProtectedRoute> <Navbar /><MyVehicles /> </ProtectedRoute>
          } />
          
          <Route path="/agendar" element={
            <ProtectedRoute> <Navbar /><NewBooking /> </ProtectedRoute>
          } />
          
          <Route path="/my-bookings" element={
            <ProtectedRoute> <Navbar /><MyBookings /> </ProtectedRoute>
          } />
          
          <Route path="/book" element={
            <ProtectedRoute> <Navbar /><NewBooking /> </ProtectedRoute>
          } />

          {/* --- ROTAS DE OFICINAS --- */}
          <Route path="/workshops" element={
            <ProtectedRoute> <Navbar /><WorkshopsList /> </ProtectedRoute>
          } />
          
          <Route path="/workshops/:id" element={
            <ProtectedRoute> <Navbar /><WorkshopDetails /> </ProtectedRoute>
          } />

          {/* --- CATCH ALL --- */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;