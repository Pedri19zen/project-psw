import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import AdminLayout from './components/AdminLayout';

function App() {
  // BYPASS: Hardcoded user state so you can work without Member 3's login system
  const [user, setUser] = useState({ 
    name: 'Admin User', 
    role: 'admin_oficina', 
    isAuthenticated: true 
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to admin dashboard for now */}
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout user={user} />}>
          <Route path="dashboard" element={<h2>Dashboard Overview (Coming Soon)</h2>} />
          <Route path="services" element={<h2>Manage Services (Coming Soon)</h2>} />
          <Route path="staff" element={<h2>Manage Staff (Coming Soon)</h2>} />
          <Route path="settings" element={<h2>Workshop Settings (Coming Soon)</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;