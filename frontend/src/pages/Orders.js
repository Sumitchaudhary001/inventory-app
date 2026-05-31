import React, { useEffect, useState } from 'react';
import API from '../api';

const exportCSV = (orders, getCustomerName) => {
  const headers = ['Order ID', 'Customer', 'Total Amount', 'Status', 'Date'];
  const rows = orders.map(o => [
    `#${o.id}`,
    getCustomerName(o.customer_id),
    `₹${o.total_amount}`,
    o.status || 'Pending',
    new Date(o.created_at).toLocaleDateString('en-IN')
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const STATUS_COLORS = {
  Pending:   { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Confirmed: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Shipped:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Delivered: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [msg, setMsg] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');

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
      try {
        await API.delete(`/orders/${id}`);
        if (selectedOrder?.id === id) setSelectedOrder(null);
        load();
      } catch (e) {
        setMsg({ type: 'error', text: '❌ ' + (e.response?.data?.detail || 'Error') });
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      load();
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
    } catch (e) {
      setMsg({ type: 'error', text: '❌ Failed to update status' });
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

  const filtered = orders.filter(o =>
    getCustomerName(o.customer_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Sales Orders</h1>
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

      {selectedOrder && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center'}}
          onClick={() => setSelectedOrder(null)}>
          <div style={{background:'white', borderRadius:16, padding:32, width:'90%', maxWidth:500}}
            onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:18, fontWeight:700}}>Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}
                style={{background:'#f1f5f9', border:'none', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:700}}>✕</button>
            </div>
            <div style={{background:'#f8fafc', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:12, color:'#64748b', marginBottom:4, fontWeight:600}}>CUSTOMER</p>
              <p style={{fontWeight:600}}>{getCustomerName(selectedOrder.customer_id)}</p>
            </div>
            <div style={{background:'#f8fafc', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:12, color:'#64748b', marginBottom:10, fontWeight:600}}>UPDATE STATUS</p>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map(s => (
                  <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                    style={{
                      padding:'7px 16px', borderRadius:20,
                      border: `1.5px solid ${STATUS_COLORS[s].border}`,
                      background: selectedOrder.status === s ? STATUS_COLORS[s].bg : 'white',
                      color: STATUS_COLORS[s].color,
                      fontWeight:600, fontSize:13, cursor:'pointer'
                    }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{background:'#f8fafc', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:12, color:'#64748b', marginBottom:8, fontWeight:600}}>ITEMS</p>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #e2e8f0'}}>
                  <span style={{fontSize:14}}>{getProductName(item.product_id)}</span>
                  <span style={{color:'#64748b', fontSize:14}}>x{item.quantity} — ₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0'}}>
              <span style={{fontWeight:600, fontSize:15}}>Total Amount</span>
              <span style={{fontWeight:700, fontSize:22, color:'#0f172a'}}>₹{selectedOrder.total_amount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="table-box">
        <div className="table-header">
          <h2>All Orders</h2>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <span className="table-count">{filtered.length} orders</span>
            <button
              onClick={() => exportCSV(filtered, getCustomerName)}
              style={{background:'#f1f5f9', color:'#0f172a', border:'none', padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6}}>
              ⬇️ Export CSV
            </button>
          </div>
        </div>
        <div style={{padding:'12px 20px', borderBottom:'1px solid #f1f5f9'}}>
          <input
            placeholder="🔍 Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{width:'100%', maxWidth:400, padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, background:'#f8fafc'}}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🛒</div>
            <p>{search ? 'No orders match your search' : 'No orders yet. Create your first order above!'}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const s = o.status || 'Pending';
                const sc = STATUS_COLORS[s] || STATUS_COLORS.Pending;
                return (
                  <tr key={o.id}>
                    <td><span className="badge badge-blue">#{o.id}</span></td>
                    <td><strong>{getCustomerName(o.customer_id)}</strong></td>
                    <td><strong>₹{o.total_amount}</strong></td>
                    <td>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        border: `1px solid ${sc.border}`,
                        padding:'3px 10px', borderRadius:20,
                        fontSize:12, fontWeight:600
                      }}>{s}</span>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn-edit" onClick={() => viewDetails(o.id)}>👁️ Details</button>
                      <button className="btn-delete" onClick={() => del(o.id)}>Cancel</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}