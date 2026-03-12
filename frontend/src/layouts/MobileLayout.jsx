import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import NewTrade  from '../pages/NewTrade';
import Journal   from '../pages/Journal';
import { MonthlyReports, YearlyReports } from '../pages/Reports';
import '../styles/mobile.css';

export default function MobileLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  
  const doLogout = () => { logout(); nav('/login'); setOpen(false); };
  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  return (
    <div className="layout m-layout">
      {/* Mobile Top Header */}
      <header className="m-header">
        <button className="m-hamb" onClick={toggle}>☰</button>
        <div className="m-logo">Trading Journal</div>
        <div style={{ width: 40 }}></div> {/* spacer */}
      </header>

      {/* Overlay */}
      <div className={`m-overlay ${open ? 'show' : ''}`} onClick={close}></div>

      {/* Sidebar as Drawer */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">Trading Journal</div>
        <nav className="sidebar-nav">
          <NavLink to="/"             end className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={close}>Dashboard</NavLink>
          <NavLink to="/new-trade"        className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={close}>New Trade</NavLink>
          <NavLink to="/journal"          className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={close}>Journal</NavLink>
          <NavLink to="/monthly"          className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={close}>Monthly</NavLink>
          <NavLink to="/yearly"           className={({isActive})=>isActive?'nav-item active':'nav-item'} onClick={close}>Yearly</NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="user-info">@{user?.username}</div>
          <button className="btn btn-ghost btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
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
