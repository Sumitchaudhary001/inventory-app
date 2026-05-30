import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="cards">
        <div className="card"><h3>Total Products</h3><p>{data.total_products}</p></div>
        <div className="card"><h3>Total Customers</h3><p>{data.total_customers}</p></div>
        <div className="card"><h3>Total Orders</h3><p>{data.total_orders}</p></div>
        <div className="card"><h3>Low Stock</h3><p className="low-stock">{data.low_stock_products.length}</p></div>
      </div>
      {data.low_stock_products.length > 0 && (
        <div>
          <h2 style={{marginBottom:16}}>⚠️ Low Stock Products</h2>
          <table>
            <thead><tr><th>Name</th><th>SKU</th><th>Quantity</th></tr></thead>
            <tbody>
              {data.low_stock_products.map(p => (
                <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td className="low-stock">{p.quantity}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}