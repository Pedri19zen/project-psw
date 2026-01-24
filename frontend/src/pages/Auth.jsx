import React, { useState } from 'react';
import api from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext'; 
import logoImg from '../assets/logo-repro-removebg-preview.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'client' });
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleRedirect = (role) => {
    // 1. Force lowercase to avoid case-sensitivity issues
    const userRole = role ? role.toLowerCase() : 'client';
    
    // DEBUG: Check this in your browser console (F12)
    console.log("👉 DEBUG: Attempting redirect for role:", userRole);

    // 2. The Check
    if (['admin', 'staff', 'mechanic'].includes(userRole)) {
      console.log("✅ Recognized as Team Member -> Sending to Admin Dashboard");
      navigate('/admin/dashboard');
    } else {
      console.log("ℹ️ Recognized as Client -> Sending to Client Dashboard");
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      console.log("Login Success. Server sent:", res.data);

      login({
        token: res.data.token,
        role: res.data.role,
        name: res.data.name
      });

      handleRedirect(res.data.role);

    } catch (error) {
      console.error("Auth Error:", error);
      const errorMsg = error.response?.data?.msg || "Erro na autenticação.";
      alert(errorMsg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      
      login({
        token: res.data.token,
        role: res.data.role,
        name: res.data.name
      });

      handleRedirect(res.data.role);
    } catch (error) {
      console.error("Google Auth Error:", error); 
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
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required style={inputStyle} 
          />
          <input 
            type="password" 
            placeholder="Password" 
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

// Styles
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: '#f8fafc' };
const cardStyle = { maxWidth: '420px', width: '100%', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' };
const inputStyle = { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px' };
const buttonStyle = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' };
const dividerStyle = { margin: '25px 0', display: 'flex', alignItems: 'center' };
const lineStyle = { flex: 1, height: '1px', background: '#f1f5f9' };
const toggleStyle = { marginTop: '25px', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

export default Auth;