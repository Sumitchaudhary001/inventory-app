import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [msg, setMsg] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = () => API.get('/orders').then(r => setOrders(r.data));
  useEffect(() => {
    load();
    API.get('/customers').then(r => setCustomers(r.data));
    API.get('/products').then(r => setProducts(r.data));
  }, []);

  const validate = () => {
    if (!customerId) return 'Please select a customer';
    if (items.some(i => !i.product_id)) return 'Please select a product for each item';
    if (items.some(i => i.quantity < 1)) return 'Quantity must be at least 1';
    return null;
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const submit = async () => {
    const err = validate();
    if (err) { setMsg({ type: 'error', text: '❌ ' + err }); return; }
    try {
      await API.post('/orders', {
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      setMsg({ type: 'success', text: '✅ Order placed successfully!' });
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (e) {
      setMsg({ type: 'error', text: '❌ ' + (e.response?.data?.detail || 'Error') });
    }
  };

  const del = async (id) => {
    if (window.confirm('Cancel this order?')) {
      await API.delete(`/orders/${id}`);
      if (selectedOrder?.id === id) setSelectedOrder(null);
      load();
    }
  };

  const viewDetails = async (id) => {
    const r = await API.get(`/orders/${id}`);
    setSelectedOrder(r.data);
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.full_name : `Customer #${id}`;
  };

  const getProductName = (id) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : `Product #${id}`;
  };

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      <p className="page-sub">Create and manage customer orders</p>

      <div className="form-box">
        <h2>🛒 Create New Order</h2>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

        <select value={customerId} onChange={e => setCustomerId(e.target.value)}
          style={{width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, marginBottom:16, background:'#f8fafc', color:'#0f172a'}}>
          <option value="">Select Customer *</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
        </select>

        <p style={{fontSize:13, fontWeight:600, color:'#64748b', marginBottom:10}}>ORDER ITEMS</p>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex', gap:8, marginBottom:10, alignItems:'center'}}>
            <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
              style={{flex:3, padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, background:'#f8fafc'}}>
              <option value="">Select Product *</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} (stock: {p.quantity})</option>)}
            </select>
            <input type="number" min="1" value={item.quantity}
              onChange={e => updateItem(i, 'quantity', e.target.value)}
              style={{flex:1, padding:'11px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14}} />
            {items.length > 1 && (
              <button onClick={() => removeItem(i)}
                style={{background:'#fee2e2', color:'#ef4444', border:'none', padding:'10px 14px', borderRadius:10, cursor:'pointer', fontWeight:700}}>✕</button>
            )}
          </div>
        ))}

        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button className="btn-secondary" onClick={addItem}>+ Add Item</button>
          <button className="btn-primary" onClick={submit}>Place Order</button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center'}}
          onClick={() => setSelectedOrder(null)}>
          <div style={{background:'white', borderRadius:16, padding:32, width:'90%', maxWidth:480}}
            onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:18, fontWeight:700}}>Order #{selectedOrder.id} Details</h2>
              <button onClick={() => setSelectedOrder(null)}
                style={{background:'#f1f5f9', border:'none', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:700}}>✕</button>
            </div>
            <div style={{background:'#f8fafc', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:13, color:'#64748b', marginBottom:4}}>CUSTOMER</p>
              <p style={{fontWeight:600}}>{getCustomerName(selectedOrder.customer_id)}</p>
            </div>
            <div style={{background:'#f8fafc', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:13, color:'#64748b', marginBottom:8}}>ITEMS</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #e2e8f0'}}>
                  <span>{getProductName(item.product_id)}</span>
                  <span style={{color:'#64748b'}}>x{item.quantity} — ₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontWeight:600, fontSize:16}}>Total</span>
              <span style={{fontWeight:700, fontSize:20, color:'#0f172a'}}>₹{selectedOrder.total_amount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="table-box">
        <div className="table-header">
          <h2>All Orders</h2>
          <span className="table-count">{orders.length} orders</span>
        </div>
        {orders.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🛒</div>
            <p>No orders yet. Create your first order above!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className="badge badge-blue">#{o.id}</span></td>
                  <td>{getCustomerName(o.customer_id)}</td>
                  <td><strong>₹{o.total_amount}</strong></td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className="btn-edit" onClick={() => viewDetails(o.id)}>👁️ Details</button>
                    <button className="btn-delete" onClick={() => del(o.id)}>Cancel</button>
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