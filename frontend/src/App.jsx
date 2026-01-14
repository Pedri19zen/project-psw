import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação de Componentes (Member 3 - Design System)
import Navbar from './components/Navbar';

// Importação de Páginas
import Auth from './pages/Auth';
import MyVehicles from './pages/MyVehicles';
import NewBooking from './pages/NewBooking';
import ClientDashboard from './pages/ClientDashboard';

// --- LÓGICA DE SEGURANÇA (Membro 3: Security & Auth) ---
/**
 * ProtectedRoute verifica se existe um token no localStorage.
 * Se não existir, redireciona o utilizador para o Login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      {/* A Navbar é injetada aqui para estar presente em todas as páginas */}
      <Navbar />

      {/* Container principal com classe de animação definida no variables.css */}
      <div className="fade-in" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          {/* Rota Pública: Autenticação */}
          <Route path="/login" element={<Auth />} />

          {/* Rotas Protegidas: Apenas Clientes Autenticados podem aceder */}
          <Route 
            path="/veiculos" 
            element={
              <ProtectedRoute>
                <MyVehicles />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/agendar" 
            element={
              <ProtectedRoute>
                <NewBooking />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redirecionamento Padrão: Se a rota não existir ou for a raiz, vai para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all: Qualquer outra rota volta para o Dashboard ou Login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;