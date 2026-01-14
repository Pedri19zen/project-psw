import { Outlet, Link } from 'react-router-dom';
import styles from './AdminLayout.module.css'; 

const AdminLayout = ({ user }) => {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Oficina<span>Manager</span></h2>
        </div>
        
        <nav className={styles.nav}>
          <Link to="/admin/dashboard" className={styles.link}>Dashboard</Link>
          <Link to="/admin/services" className={styles.link}>Services</Link>
          <Link to="/admin/staff" className={styles.link}>Staff</Link>
          <Link to="/admin/settings" className={styles.link}>Config Settings</Link>
        </nav>

        <div className={styles.userProfile}>
          <p>{user.name}</p>
          <small>{user.role}</small>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Administration</h1>
        </header>
        <div className={styles.content}>
          {/* Outlet renders the child route (Dashboard, Services, etc.) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;