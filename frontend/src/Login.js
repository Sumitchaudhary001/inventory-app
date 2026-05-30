import React, { useState } from 'react';
import { Package } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (email === 'admin@inventory.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <Package size={48} color="white" style={{marginBottom:16}}/>
          <h1>StockFlow Pro</h1>
          <p>Smart inventory management for modern businesses</p>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <span className="lf-icon">📈</span>
            <div>
              <strong>Real-Time Stock Tracking</strong>
              <p>Monitor inventory levels instantly across all products</p>
            </div>
          </div>
          <div className="login-feature">
            <span className="lf-icon">🧾</span>
            <div>
              <strong>Order Management</strong>
              <p>Create, track and manage customer orders seamlessly</p>
            </div>
          </div>
          <div className="login-feature">
            <span className="lf-icon">👤</span>
            <div>
              <strong>Customer Database</strong>
              <p>Maintain a complete record of all your customers</p>
            </div>
          </div>
          <div className="login-feature">
            <span className="lf-icon">📊</span>
            <div>
              <strong>Business Dashboard</strong>
              <p>Get a bird's eye view of your entire business</p>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to your StockFlow account</p>

          {error && <div className="msg error">❌ {error}</div>}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div className="login-hint">
            <span style={{color:'#374151', fontWeight:600}}>Demo Credentials</span>
            <span style={{color:'#64748b', fontSize:12}}> (use these for testing)</span>
            <code style={{color:'#111', marginTop:6, display:'block'}}>📧 admin@inventory.com</code>
            <code style={{color:'#111', display:'block'}}>🔑 admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}