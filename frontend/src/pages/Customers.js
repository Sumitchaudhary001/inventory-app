import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => API.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.full_name) { setMsg({ type: 'error', text: '❌ Full name is required' }); return; }
    if (!form.email) { setMsg({ type: 'error', text: '❌ Email is required' }); return; }
    if (!form.email.includes('@')) { setMsg({ type: 'error', text: '❌ Please enter a valid email' }); return; }
    if (!form.phone) { setMsg({ type: 'error', text: '❌ Phone number is required' }); return; }
    try {
      await API.post('/customers', form);
      setMsg({ type: 'success', text: '✅ Customer added!' });
      setForm({ full_name: '', email: '', phone: '' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: '❌ ' + (e.response?.data?.detail || 'Error') });
    }
  };

  const del = async (id) => {
    const customer = customers.find(c => c.id === id);
    if (window.confirm(`Delete ${customer.full_name}? This will also delete all their orders.`)) {
      try {
        await API.delete(`/customers/${id}`);
        setMsg({ type: 'success', text: '✅ Customer deleted successfully!' });
        load();
      } catch (e) {
        setMsg({ type: 'error', text: '❌ ' + (e.response?.data?.detail || 'Error deleting customer') });
      }
    }
  };

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-sub">Manage your customer database</p>

      <div className="form-box">
        <h2>➕ Add Customer</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        <div className="form-grid">
          <input placeholder="Full Name *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          <input placeholder="Email Address *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input placeholder="Phone Number *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <button className="btn-primary" onClick={submit}>Add Customer</button>
      </div>

      <div className="table-box">
        <div className="table-header">
          <h2>All Customers</h2>
          <span className="table-count">{filtered.length} customers</span>
        </div>
        <div style={{padding:'12px 20px', borderBottom:'1px solid #f1f5f9'}}>
          <input
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{width:'100%', maxWidth:400, padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, background:'#f8fafc'}}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <p>{search ? 'No customers match your search' : 'No customers yet. Add one above!'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.full_name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td><button className="btn-delete" onClick={() => del(c.id)}>🗑️ Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}