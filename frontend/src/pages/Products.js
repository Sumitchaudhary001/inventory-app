import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [msg, setMsg] = useState(null);

  const load = () => API.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await API.post('/products', { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
      setMsg({ type: 'success', text: 'Product added!' });
      setForm({ name: '', sku: '', price: '', quantity: '' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error' });
    }
  };

  const del = async (id) => {
    await API.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <div className="form-box">
        <h2>Add Product</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
        <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        <button onClick={submit}>Add Product</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Quantity</th><th>Action</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.sku}</td><td>${p.price}</td><td>{p.quantity}</td>
              <td><button className="btn-delete" onClick={() => del(p.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}