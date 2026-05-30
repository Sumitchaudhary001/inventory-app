import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Login from './Login';
import './App.css';

function Layout({ onLogout }) {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/products', icon: '📦', label: 'Inventory' },
    { path: '/customers', icon: '👥', label: 'Customers' },
    { path: '/orders', icon: '🛒', label: 'Sales Orders' },
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
          <span>📦</span>
          <span>Inventory Pro</span>
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
        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={onLogout}>
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{pageTitles[location.pathname] || 'Inventory Pro'}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">A</div>
              <span>Admin</span>
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