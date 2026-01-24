import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');

    if (token && storedRole) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Normalize role to lowercase immediately
      setUser({ 
        token, 
        role: storedRole.toLowerCase(), 
        name: storedName 
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Save everything as lowercase
    const normalizedRole = userData.role.toLowerCase();

    localStorage.setItem('token', userData.token);
    localStorage.setItem('userRole', normalizedRole);
    localStorage.setItem('userName', userData.name);
    
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    
    setUser({ 
      ...userData, 
      role: normalizedRole 
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);