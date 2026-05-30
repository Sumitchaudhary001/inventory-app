import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [msg, setMsg] = useState(null);

  const load = () => API.get('/orders').then(r => setOrders(r.data));
  useEffect(() => {
    load();
    API.get('/customers').then(r => setCustomers(r.data));
    API.get('/products').then(r => setProducts(r.data));
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const submit = async () => {
    try {
      await API.post('/orders', {
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      setMsg({ type: 'success', text: 'Order created!' });
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error' });
    }
  };

  const del = async (id) => {
    await API.delete(`/orders/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      <div className="form-box">
        <h2>Create Order</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
        <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex', gap:8, marginBottom:8}}>
            <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} style={{flex:2}}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{flex:1, padding:'10px', border:'1px solid #ddd', borderRadius:8}} />
          </div>
        ))}
        <button onClick={addItem} style={{marginRight:8, background:'#6366f1'}}>+ Add Item</button>
        <button onClick={submit}>Place Order</button>
      </div>
      <table>
        <thead><tr><th>Order ID</th><th>Customer ID</th><th>Total</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td><td>{o.customer_id}</td><td>${o.total_amount}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td><button className="btn-delete" onClick={() => del(o.id)}>Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}