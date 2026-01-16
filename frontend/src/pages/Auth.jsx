import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import logoImg from '../assets/logo-repro-removebg-preview.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Cliente' });
  const navigate = useNavigate();

  // Lógica de Redirecionamento Centralizada
  const handleRedirect = (role) => {
    // Normalizamos para minúsculas para evitar erros de escrita do Backend
    const userRole = role ? role.toLowerCase() : 'cliente';

    if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'staff') {
      navigate('/staff');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      // 1. Guardar dados (Vital para a ProtectedRoute do App.jsx ler)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.name);

      // 2. Redirecionar
      handleRedirect(res.data.role);

    } catch (error) {
      console.error("Erro:", error);
      const errorMsg = error.response?.data?.msg || "Erro na autenticação.";
      alert(errorMsg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.name);

      handleRedirect(res.data.role);

    } catch (error) {
      console.error("Detalhes do erro Google:", error); 
      alert("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="fade-in" style={containerStyle}>
      <div style={cardStyle}>
        <img src={logoImg} alt="Repro Logo" style={{ width: '180px', marginBottom: '15px' }} />
        
        <h2 style={{ color: '#2563eb', marginBottom: '5px' }}>
          {isLogin ? 'Iniciar Sessão' : 'Criar Conta'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px' }}>
          {isLogin ? 'Bem-vindo de volta!' : 'Junte-se à nossa rede de oficinas.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Nome Completo" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required style={inputStyle} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            autoComplete="email"
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required style={inputStyle} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            autoComplete="current-password"
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required style={inputStyle} 
          />
          
          <button type="submit" style={buttonStyle}>
            {isLogin ? 'Entrar' : 'Finalizar Registo'}
          </button>
        </form>

        <div style={dividerStyle}>
          <div style={lineStyle}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#94a3b8' }}>OU</span>
          <div style={lineStyle}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <p onClick={() => setIsLogin(!isLogin)} style={toggleStyle}>
          {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já tem uma conta? Inicie sessão'}
        </p>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: '#f8fafc' };
const cardStyle = { maxWidth: '420px', width: '100%', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px' };
const buttonStyle = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
const dividerStyle = { margin: '25px 0', display: 'flex', alignItems: 'center' };
const lineStyle = { flex: 1, height: '1px', background: '#f1f5f9' };
const toggleStyle = { marginTop: '25px', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

export default Auth;