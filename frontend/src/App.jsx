import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewTrade  from './pages/NewTrade';
import Journal   from './pages/Journal';
import { MonthlyReports, YearlyReports } from './pages/Reports';
import './styles.css';

// Light theme is forced by default in CSS now. No theme toggle required.
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading full-page">Loading…</div>;
  return user ? children : <Navigate to="/login" replace/>;
}

function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = () => { logout(); nav('/login'); setMobileOpen(false); };
  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`layout-container ${mobileOpen ? 'm-open' : ''}`}>
      {/* Mobile Header (Visible only on <768px) */}
      <header className="mobile-header">
        <button className="hamb-btn" onClick={toggleMobile}>
          {mobileOpen ? '✕' : '☰'}
        </button>
        <div className="mobile-logo">Trading Journal</div>
        <div style={{width: 40}}></div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={closeMobile}></div>}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">Trading Journal</div>
        <nav className="sidebar-nav">
          <NavLink to="/"             end className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={closeMobile}>Dashboard</NavLink>
          <NavLink to="/new-trade"        className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={closeMobile}>New Trade</NavLink>
          <NavLink to="/journal"          className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={closeMobile}>Journal</NavLink>
          <NavLink to="/monthly"          className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={closeMobile}>Monthly</NavLink>
          <NavLink to="/yearly"           className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={closeMobile}>Yearly</NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="user-info">@{user?.username}</div>
          <button className="btn btn-ghost btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/"          element={<Dashboard/>}/>
          <Route path="/new-trade" element={<NewTrade/>}/>
          <Route path="/journal"   element={<Journal/>}/>
          <Route path="/monthly"   element={<MonthlyReports/>}/>
          <Route path="/yearly"    element={<YearlyReports/>}/>
          <Route path="*"          element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/*" element={<Protected><Layout/></Protected>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
