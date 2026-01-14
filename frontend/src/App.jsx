import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import ServiceList from './components/services/ServiceList';
import ServiceForm from './components/services/ServiceForm';
import WorkshopSettings from './components/workshop/WorkshopSettings';

function App() {
  // Mock user state
  const [user, setUser] = useState({ 
    name: 'Admin User', 
    role: 'admin_oficina', 
    isAuthenticated: true 
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Redirect root URL (localhost:5173) to the dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 2. The Admin Section */}
        <Route path="/admin" element={<AdminLayout user={user} />}>
        <Route path="services/new" element={<ServiceForm />} />
        <Route path="services" element={<ServiceList />} />
          
          {/* This matches /admin/dashboard */}
          <Route path="dashboard" element={<h2>Dashboard Overview</h2>} />
          
          {/* This matches /admin/services */}
          <Route path="services" element={<ServiceList />} />
          
          {/* Placeholders for future pages */}
          <Route path="staff" element={<h2>Manage Staff</h2>} />
          <Route path="settings" element={<WorkshopSettings />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;