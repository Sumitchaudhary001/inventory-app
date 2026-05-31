import React, { useEffect, useState } from 'react';
import { ShoppingCart, AlertTriangle, Package, Users, TrendingUp, IndianRupee } from 'lucide-react';
import API from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div className="empty">
      <div className="empty-icon">⏳</div>
      <p>Loading dashboard...</p>
    </div>
  );

  const topStocked = data.top_stocked_products || [];
  const recentOrders = data.recent_orders || [];
  const lowStock = data.low_stock_products || [];
  const maxStock = topStocked.length > 0 ? Math.max(...topStocked.map(p => p.quantity)) : 1;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back! Here's what's happening today.</p>

      {/* Sales Activity Cards */}
      <p style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'#94a3b8', marginBottom:12}}>SALES ACTIVITY</p>
      <div className="activity-cards">
        <div className="activity-card">
          <div className="ac-number ac-blue">{data.total_orders || 0}</div>
          <div className="ac-label"><ShoppingCart size={14}/> Total Orders</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-orange">{lowStock.length}</div>
          <div className="ac-label"><AlertTriangle size={14}/> Low Stock Items</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-green">{data.total_products || 0}</div>
          <div className="ac-label"><Package size={14}/> Total Products</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-purple">{data.total_customers || 0}</div>
          <div className="ac-label"><Users size={14}/> Total Customers</div>
        </div>
      </div>

      {/* Total Sales Banner */}
      <div className="sales-banner">
        <div className="sales-banner-left">
          <div className="sales-banner-icon"><IndianRupee size={24} color="white"/></div>
          <div>
            <p className="sales-banner-label">Total Revenue Generated</p>
            <p className="sales-banner-value">₹{(data.total_sales || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="sales-banner-right">
          <TrendingUp size={48} color="rgba(255,255,255,0.2)"/>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Top Stocked Products */}
        <div className="dash-box">
          <div className="dash-box-title">TOP STOCKED PRODUCTS</div>
          <div className="dash-box-content">
            {topStocked.length === 0 ? (
              <div style={{textAlign:'center', padding:'20px 0', color:'#94a3b8'}}>
                <Package size={32} style={{marginBottom:8}}/>
                <p style={{fontSize:13}}>No products yet</p>
              </div>
            ) : (
              topStocked.map(p => (
                <div key={p.id} style={{marginBottom:14}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                    <span style={{fontSize:13, fontWeight:500, color:'#374151'}}>{p.name}</span>
                    <span style={{fontSize:13, fontWeight:700, color:'#0f172a'}}>{p.quantity} units</span>
                  </div>
                  <div style={{background:'#f1f5f9', borderRadius:999, height:6, overflow:'hidden'}}>
                    <div style={{
                      height:'100%',
                      borderRadius:999,
                      background: p.quantity < 5 ? '#e53e3e' : '#2563eb',
                      width: `${Math.max((p.quantity / maxStock) * 100, 4)}%`,
                      transition:'width 0.6s ease'
                    }}/>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

{/* Recent Orders */}
        <div className="dash-box">
          <div className="dash-box-title">RECENT ORDERS</div>
          <div className="dash-box-content">
            {recentOrders.length === 0 ? (
              <div style={{textAlign:'center', padding:'20px 0', color:'#94a3b8'}}>
                <ShoppingCart size={32} style={{marginBottom:8}}/>
                <p style={{fontSize:13}}>No orders yet</p>
              </div>
            ) : (
              recentOrders.map(o => {
                const STATUS_COLORS = {
                  Pending:   { bg: '#fff7ed', color: '#c2410c' },
                  Confirmed: { bg: '#eff6ff', color: '#1d4ed8' },
                  Shipped:   { bg: '#f0fdf4', color: '#15803d' },
                  Delivered: { bg: '#f0fdf4', color: '#166534' },
                };
                const s = o.status || 'Pending';
                const sc = STATUS_COLORS[s] || STATUS_COLORS.Pending;
                return (
                  <div key={o.id} className="dash-row">
                    <div>
                      <p style={{fontSize:13, fontWeight:600, color:'#0f172a'}}>{o.customer_name}</p>
                      <p style={{fontSize:11, color:'#94a3b8'}}>Order #{o.id} · {new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
                      <span style={{fontSize:14, fontWeight:700, color:'#10b981'}}>₹{o.total_amount}</span>
                      <span style={{fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:sc.bg, color:sc.color}}>{s}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="dash-box">
          <div className="dash-box-title">INVENTORY SUMMARY</div>
          <div className="dash-box-content">
            <div className="dash-row">
              <span className="dash-row-label">Total Products</span>
              <span className="dash-row-value green">{data.total_products || 0}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Low Stock Items</span>
              <span className="dash-row-value red">{lowStock.length}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Total Customers</span>
              <span className="dash-row-value green">{data.total_customers || 0}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Total Orders</span>
              <span className="dash-row-value green">{data.total_orders || 0}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Total Revenue</span>
              <span className="dash-row-value green">₹{(data.total_sales || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="dash-box">
          <div className="dash-box-title">LOW STOCK ALERT</div>
          <div className="dash-box-content">
            {lowStock.length === 0 ? (
              <div style={{textAlign:'center', padding:'20px 0', color:'#10b981'}}>
                <TrendingUp size={32} style={{marginBottom:8}}/>
                <p style={{fontSize:13}}>All products well stocked!</p>
              </div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="dash-row">
                  <span className="dash-row-label">{p.name}</span>
                  <span className="dash-row-value red">{p.quantity} left</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}