import React, { useState } from 'react';

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
          <span className="login-logo">📦</span>
          <h1>Inventory Pro</h1>
          <p>Manage your business smarter</p>
        </div>
        <div className="login-features">
          <div className="login-feature">✅ Real-time inventory tracking</div>
          <div className="login-feature">✅ Order management</div>
          <div className="login-feature">✅ Customer database</div>
          <div className="login-feature">✅ Dashboard analytics</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to your account</p>

          {error && <div className="msg error">❌ {error}</div>}

          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@inventory.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div className="login-hint">
            <span>Demo credentials:</span>
            <code>admin@inventory.com / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}