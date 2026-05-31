import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => API.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.name) return 'Product name is required';
    if (!form.sku) return 'SKU is required';
    if (!form.price || form.price <= 0) return 'Valid price is required';
    if (form.quantity === '' || form.quantity < 0) return 'Valid quantity is required';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setMsg({ type: 'error', text: '❌ ' + err }); return; }
    try {
      if (editId) {
        await API.put(`/products/${editId}`, { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
        setMsg({ type: 'success', text: '✅ Product updated!' });
        setEditId(null);
      } else {
        await API.post('/products', { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
        setMsg({ type: 'success', text: '✅ Product added!' });
      }
      setForm({ name: '', sku: '', price: '', quantity: '' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: '❌ ' + (e.response?.data?.detail || 'Error') });
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity });
    window.scrollTo(0, 0);
    setMsg(null);
  };

  const del = async (id) => {
    await API.delete(`/products/${id}`);
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Inventory</h1>
      <p className="page-sub">Manage your product inventory</p>

      <div className="form-box">
        <h2>{editId ? 'Edit Product' : '➕ Add New Product'}</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        <div className="form-grid">
          <input placeholder="Product Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="SKU Code *" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
          <input placeholder="Price (₹) *" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input placeholder="Quantity *" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        </div>
        <div>
          {editId && (
            <button className="btn-secondary" onClick={() => {
              setEditId(null);
              setForm({ name: '', sku: '', price: '', quantity: '' });
              setMsg(null);
            }}>Cancel</button>
          )}
          <button className="btn-primary" onClick={submit}>
            {editId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>

      <div className="table-box">
        <div className="table-header">
          <h2>All Products</h2>
          <span className="table-count">{filtered.length} items</span>
        </div>
        <div style={{padding:'12px 20px', borderBottom:'1px solid #f1f5f9'}}>
          <input
            placeholder="🔍 Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{width:'100%', maxWidth:400, padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, background:'#f8fafc'}}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"></div>
            <p>{search ? 'No products match your search' : 'No products yet. Add your first product above!'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="badge badge-blue">{p.sku}</span></td>
                  <td>₹{p.price}</td>
                  <td>
                    <span className={`badge ${p.quantity < 5 ? 'badge-red' : 'badge-green'}`}>
                      {p.quantity} units
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => startEdit(p)}> Edit</button>
                    <button className="btn-delete" onClick={() => del(p.id)}> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}