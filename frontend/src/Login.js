import React, { useState } from 'react';
import { Package } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setTimeout(() => {
      // Check default admin
      if (email === 'admin@inventory.com' && password === 'admin123') {
        onLogin();
        return;
      }
      // Check saved users
      const users = JSON.parse(localStorage.getItem('inv_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 1000);
  };

  const handleSignup = () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('inv_users') || '[]');
      if (users.find(u => u.email === email)) {
        setError('Email already registered');
        setLoading(false);
        return;
      }
      users.push({ name, email, password });
      localStorage.setItem('inv_users', JSON.stringify(users));
      setSuccess('Account created! Please sign in.');
      setIsSignup(false);
      setEmail(email);
      setPassword('');
      setName('');
      setError('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <Package size={48} color="white" style={{marginBottom:16}}/>
          <h1>Inventory & Order Management System</h1>
          <p>Manage your business smarter and faster</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>{isSignup ? 'Create account' : 'Welcome back'}</h2>
          <p className="login-sub">{isSignup ? 'Sign up to get started' : 'Sign in to your account'}</p>

          {error && <div className="msg error">❌ {error}</div>}
          {success && <div className="msg success">✅ {success}</div>}

          {isSignup && (
            <div className="login-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
              />
            </div>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())}
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={isSignup ? 'Min 6 characters' : 'Enter your password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())}
            />
          </div>

          <button className="login-btn" onClick={isSignup ? handleSignup : handleLogin} disabled={loading}>
            {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create Account →' : 'Sign in →')}
          </button>

          <div style={{textAlign:'center', marginBottom:20}}>
            <span style={{fontSize:14, color:'#64748b'}}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }}
              style={{background:'none', border:'none', color:'#2563eb', fontWeight:600, fontSize:14, cursor:'pointer'}}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {!isSignup && (
            <div className="login-hint">
              <span style={{color:'#374151', fontWeight:600}}>Demo Credentials</span>
              <span style={{color:'#64748b', fontSize:12}}> (use these for testing)</span>
              <code style={{color:'#111', marginTop:6, display:'block'}}>admin@inventory.com</code>
              <code style={{color:'#111', display:'block'}}>admin123</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}