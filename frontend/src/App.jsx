import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewTrade  from './pages/NewTrade';
import Journal   from './pages/Journal';
import { MonthlyReports, YearlyReports } from './pages/Reports';
import MobileNav from './components/MobileNav';
import './mobile.css';
import './styles.css';

function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading full-page">Loading…</div>;
  return user ? children : <Navigate to="/login" replace/>;
}

function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Trading<span>Journal</span></div>
      <nav className="sidebar-nav">
        <NavLink to="/"          className={({isActive})=>`nav-item ${isActive?'active':''}`}>Overview</NavLink>
        <NavLink to="/journal"   className={({isActive})=>`nav-item ${isActive?'active':''}`}>Journal</NavLink>
        <NavLink to="/new-trade" className={({isActive})=>`nav-item ${isActive?'active':''}`}>New Trade</NavLink>
        <NavLink to="/monthly"   className={({isActive})=>`nav-item ${isActive?'active':''}`}>Monthly</NavLink>
        <NavLink to="/yearly"    className={({isActive})=>`nav-item ${isActive?'active':''}`}>Yearly</NavLink>
      </nav>
      <div className="sidebar-foot">
        <div className="user-info">{user?.username}</div>
        <button className="btn btn-xs btn-ghost" onClick={doLogout}>Logout</button>
      </div>
    </aside>
  );
}

function DesktopLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="page">
          <Routes>
            <Route path="/"          element={<Dashboard/>}/>
            <Route path="/new-trade" element={<NewTrade/>}/>
            <Route path="/journal"   element={<Journal/>}/>
            <Route path="/monthly"   element={<MonthlyReports/>}/>
            <Route path="/yearly"    element={<YearlyReports/>}/>
            <Route path="*"          element={<Navigate to="/" replace/>}/>
          </Routes>
        </div>
      </main>
    </div>
  );
}

function MobileLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav('/login'); };

  return (
    <div className="m-layout">
      <header className="m-header">
        <div className="m-header-logo">Trading<span>Journal</span></div>
        <div className="m-header-profile" onClick={doLogout}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
      </header>
      
      <main className="m-content">
        <Routes>
          <Route path="/"          element={<Dashboard/>}/>
          <Route path="/new-trade" element={<NewTrade/>}/>
          <Route path="/journal"   element={<Journal/>}/>
          <Route path="/monthly"   element={<MonthlyReports/>}/>
          <Route path="/yearly"    element={<YearlyReports/>}/>
          <Route path="*"          element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>

      <MobileNav />
    </div>
  );
}

export default function App() {
  const [width] = useWindowSize();
  const isMobile = width <= 768;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/*" element={
            <Protected>
              {isMobile ? <MobileLayout/> : <DesktopLayout/>}
            </Protected>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
