import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// 1. Importa a imagem (ajusta o caminho conforme onde guardaste o ficheiro)
// Se a imagem estiver em public/, podes usar apenas "/logo.png" no src
import logoImg from '../assets/logo-repro.png'; 

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Cliente' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.role);
      navigate('/dashboard');
    } catch (err) {
      alert("Erro na autenticação. Verifique os seus dados.");
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'var(--background)' 
    }} className="fade-in">
      
      <div style={{ 
        maxWidth: '450px', 
        width: '100%', 
        background: 'var(--card-bg)', 
        padding: '40px', 
        borderRadius: '20px', 
        boxShadow: 'var(--shadow)',
        textAlign: 'center' 
      }}>
        
        {/* --- IMPLEMENTAÇÃO DO LOGÓTIPO --- */}
        <div style={{ marginBottom: '20px' }}>
          <img 
            src={logoImg} 
            alt="Repro Custom Performance" 
            style={{ width: '180px', height: 'auto', marginBottom: '10px' }} 
          />
          <h2 style={{ color: 'var(--primary)', margin: '0' }}>Bem-vindo</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Gestão de Oficinas Web</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Nome Completo" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              style={inputStyle} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
            style={inputStyle} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
            style={inputStyle} 
          />
          
          <button type="submit" style={buttonStyle}>
            {isLogin ? 'Entrar' : 'Registar Conta'}
          </button>
        </form>
        
        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            marginTop: '25px', 
            color: 'var(--primary)', 
            cursor: 'pointer', 
            fontSize: '15px',
            fontWeight: '500' 
          }}
        >
          {isLogin ? 'Não tem conta? Registe-se' : 'Já tem conta? Faça Login'}
        </p>
      </div>
    </div>
  );
};

// Estilos auxiliares para manter o código limpo
const inputStyle = {
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '16px',
  outline: 'none'
};

const buttonStyle = {
  padding: '14px',
  background: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '10px'
};

export default Auth;