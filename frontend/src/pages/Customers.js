import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [msg, setMsg] = useState(null);

  const load = () => API.get('/customers').then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {

    if (!form.full_name) { setMsg({ type: 'error', text: '❌ Full name is required' }); return; }
    if (!form.email) { setMsg({ type: 'error', text: '❌ Email is required' }); return; }
    if (!form.email.includes('@')) { setMsg({ type: 'error', text: '❌ Please enter a valid email' }); return; }
    if (!form.phone) { setMsg({ type: 'error', text: '❌ Phone number is required' }); return; }
    
    try {
      await API.post('/customers', form);
      setMsg({ type: 'success', text: 'Customer added!' });
      setForm({ full_name: '', email: '', phone: '' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error' });
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

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <div className="form-box">
        <h2>Add Customer</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <button onClick={submit}>Add Customer</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.full_name}</td><td>{c.email}</td><td>{c.phone}</td>
              <td><button className="btn-delete" onClick={() => del(c.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}