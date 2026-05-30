import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Login from './Login';
import './App.css';

function Layout({ onLogout }) {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
    { path: '/products', icon: <Package size={18}/>, label: 'Inventory' },
    { path: '/customers', icon: <Users size={18}/>, label: 'Customers' },
    { path: '/orders', icon: <ShoppingCart size={18}/>, label: 'Sales Orders' },
  ];

  const pageTitles = {
    '/': 'Dashboard',
    '/products': 'Inventory',
    '/customers': 'Customers',
    '/orders': 'Sales Orders',
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">📦</span>
          <span>Inventory System</span>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-section">Main Menu</div>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Dark mode toggle in sidebar bottom */}
        <div className="sidebar-bottom">
          <button className="sidebar-darkmode" onClick={() => setDarkMode(!darkMode)}>
            <span className="sidebar-icon">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</span>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon"><LogOut size={18}/></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{pageTitles[location.pathname] || 'Inventory System'}</span>
          </div>
          <div className="topbar-right">
            <Bell size={20} className="topbar-icon"/>

            {/* Admin dropdown */}
            <div className="topbar-user-wrap" ref={dropdownRef}>
              <div className="topbar-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="topbar-avatar">A</div>
                <span>Admin</span>
                <ChevronDown size={14} color="#64748b"/>
              </div>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="topbar-avatar" style={{width:36, height:36, fontSize:14}}>A</div>
                    <div>
                      <p style={{fontWeight:600, fontSize:14, color:'#0f172a'}}>Admin User</p>
                      <p style={{fontSize:12, color:'#64748b'}}>admin@inventory.com</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"/>
                  <button className="user-dropdown-item red" onClick={() => { setDropdownOpen(false); onLogout(); }}>
                    <LogOut size={16}/>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </main>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return (
    <BrowserRouter>
      <Layout onLogout={() => setLoggedIn(false)} />
    </BrowserRouter>
  );
}