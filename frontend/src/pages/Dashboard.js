import React, { useEffect, useState } from 'react';
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

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Welcome back! Here's what's happening today.</p>

      {/* Sales Activity */}
      <p style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'#94a3b8', marginBottom:12}}>SALES ACTIVITY</p>
      <div className="activity-cards">
        <div className="activity-card">
          <div className="ac-number ac-blue">{data.total_orders}</div>
          <div className="ac-label">🛒 Total Orders</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-orange">{data.low_stock_products.length}</div>
          <div className="ac-label">⚠️ Low Stock Items</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-green">{data.total_products}</div>
          <div className="ac-label">📦 Total Products</div>
        </div>
        <div className="activity-card">
          <div className="ac-number ac-purple">{data.total_customers}</div>
          <div className="ac-label">👥 Total Customers</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dash-box">
          <div className="dash-box-title">INVENTORY SUMMARY</div>
          <div className="dash-box-content">
            <div className="dash-row">
              <span className="dash-row-label">Total Products</span>
              <span className="dash-row-value green">{data.total_products}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Low Stock Items</span>
              <span className="dash-row-value red">{data.low_stock_products.length}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Total Customers</span>
              <span className="dash-row-value green">{data.total_customers}</span>
            </div>
            <div className="dash-row">
              <span className="dash-row-label">Total Orders</span>
              <span className="dash-row-value green">{data.total_orders}</span>
            </div>
          </div>
        </div>

        <div className="dash-box">
          <div className="dash-box-title">LOW STOCK ALERT</div>
          <div className="dash-box-content">
            {data.low_stock_products.length === 0 ? (
              <div style={{textAlign:'center', padding:'20px 0', color:'#10b981'}}>
                <div style={{fontSize:32, marginBottom:8}}>✅</div>
                <p style={{fontSize:13}}>All products well stocked!</p>
              </div>
            ) : (
              data.low_stock_products.map(p => (
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