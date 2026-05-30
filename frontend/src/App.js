import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1 className="logo">📦 Inventory App</h1>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/orders">Orders</Link>
          </div>
        </nav>
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;