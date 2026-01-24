import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Componentes de Layout
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

// Componentes de Administração
import ServiceList from './components/services/ServiceList';
import ServiceForm from './components/services/ServiceForm';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';
import WorkshopSettings from './components/workshop/WorkshopSettings';

// Páginas de Cliente e Auth
import Auth from "./pages/Auth";
import MyVehicles from "./pages/MyVehicles";
import NewBooking from "./pages/NewBooking"; 
import ClientDashboard from "./pages/ClientDashboard";
import MyBookings from "./pages/MyBookings"; // <-- Certifique-se de que este import existe

// --- NOVOS IMPORTS: Páginas de Oficinas ---
import WorkshopsList from "./pages/WorkshopsList";
import WorkshopDetails from "./pages/WorkshopDetails";

// --- LÓGICA DE PROTEÇÃO DE ROTA ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. LOGIN */}
        <Route path="/login" element={<Auth />} />

        {/* 2. ADMINISTRAÇÃO */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout user={{ 
                name: localStorage.getItem("userName") || "Admin", 
                role: localStorage.getItem("userRole") 
              }} />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<h2>Dashboard Overview</h2>} />
          <Route path="services" element={<ServiceList />} />
          <Route path="services/new" element={<ServiceForm />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/new" element={<StaffForm />} />
          <Route path="settings" element={<WorkshopSettings />} />
        </Route>

        {/* 3. ROTAS DE CLIENTE */}
        <Route path="/dashboard" element={<PrivateRoute><Navbar /><ClientDashboard /></PrivateRoute>} />
        <Route path="/veiculos" element={<PrivateRoute><Navbar /><MyVehicles /></PrivateRoute>} />
        <Route path="/agendar" element={<PrivateRoute><Navbar /><NewBooking /></PrivateRoute>} />
        
        {/* Nova rota adicionada aqui */}
        <Route path="/my-bookings" element={<PrivateRoute><Navbar /><MyBookings /></PrivateRoute>} />
        
        {/* Rota adicional /book apontando para o agendamento */}
        <Route path="/book" element={<PrivateRoute><Navbar /><NewBooking /></PrivateRoute>} />
        
        {/* --- NOVAS ROTAS DE OFICINAS --- */}
        <Route path="/workshops" element={<PrivateRoute><Navbar /><WorkshopsList /></PrivateRoute>} />
        <Route path="/workshops/:id" element={<PrivateRoute><Navbar /><WorkshopDetails /></PrivateRoute>} />

        {/* 4. SEGURANÇA */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;