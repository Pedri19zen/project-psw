import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import styles from './AdminLayout.module.css'; 

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Prevent crash if user is null
  if (!user) return null;

  // Role check (assumes role is lowercase from AuthContext)
  const isAdmin = user.role === 'admin';

  return (
    <div className={styles.container}>
      {/* --- SIDEBAR --- */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>REPRO<span>AUTO</span></h2>
        </div>
        
        <nav className={styles.nav}>
          {/* Links Visíveis para TODOS (Admin + Staff) */}
          <Link to="/admin/dashboard" className={styles.link}>
            📊 Dashboard
          </Link>
          
          <Link to="/admin/services" className={styles.link}>
            🔧 Serviços
          </Link>
          
          {/* Links Visíveis APENAS para ADMIN */}
          {isAdmin && (
            <>
              <div className={styles.divider}>Admin</div>
              <Link to="/admin/staff" className={styles.link}>
                👥 Gerir Staff
              </Link>
              <Link to="/admin/settings" className={styles.link}>
                ⚙️ Definições
              </Link>
            </>
          )}
        </nav>

        {/* Perfil do Utilizador no fundo */}
        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.name || "Utilizador"}</p>
            <span className={styles.userRole}>{user.role}</span>
          </div>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{isAdmin ? 'Painel de Administração' : 'Área do Funcionário'}</h1>
          <div className={styles.date}>
            {new Date().toLocaleDateString('pt-PT')}
          </div>
        </header>
        
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;