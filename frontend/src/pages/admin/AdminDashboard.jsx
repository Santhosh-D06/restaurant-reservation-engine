import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg, formatPrice } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data.stats)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <Loader />;

  const cards = [
    ['Customers', stats.customers],
    ['Restaurants', stats.restaurants],
    ['Tables', stats.tables],
    ['Menu items', stats.menuItems],
    ['Reservations', stats.reservations.total],
    ['Pending reservations', stats.reservations.pending],
    ['Confirmed reservations', stats.reservations.confirmed],
    ['Orders', stats.orders.total],
    ['Active orders', stats.orders.active],
    ['Delivered orders', stats.orders.delivered],
  ];

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="grid stats">
        {cards.map(([label, value]) => (
          <div className="card stat" key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
        <div className="card stat"><strong>{formatPrice(stats.orderValue)}</strong><span>Order value (demo payments)</span></div>
      </div>
    </>
  );
}
