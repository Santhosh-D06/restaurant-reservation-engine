import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { errMsg, formatDate, formatDateTime, formatPrice, formatTime, isPastSlot, shortId } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/reservations/my'), api.get('/orders/my')])
      .then(([r, o]) => { setReservations(r.data.reservations); setOrders(o.data.orders); })
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const upcoming = reservations
    .filter((r) => r.status !== 'cancelled' && !isPastSlot(r.date, r.timeSlot))
    .sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot));
  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="container">
      <h1>Welcome, {user.name}</h1>
      <Alert>{error}</Alert>
      <div className="grid stats">
        <div className="card stat"><strong>{upcoming.length}</strong><span>Upcoming reservations</span></div>
        <div className="card stat"><strong>{activeOrders.length}</strong><span>Active orders</span></div>
        <div className="card stat"><strong>{reservations.length}</strong><span>Total reservations</span></div>
        <div className="card stat"><strong>{orders.length}</strong><span>Total orders</span></div>
      </div>

      <div className="two-col">
        <section>
          <div className="section-head"><h2>Upcoming reservations</h2><Link to="/my-reservations">All →</Link></div>
          {upcoming.length === 0 ? <p className="muted">None. <Link to="/restaurants">Book a table</Link></p> : upcoming.slice(0, 3).map((r) => (
            <div className="card row-card" key={r._id}>
              <div><strong>{r.restaurant?.name || 'Restaurant removed'}</strong><p className="small">{formatDate(r.date)} · {formatTime(r.timeSlot)} · {r.guests} guests</p></div>
              <span className={`badge badge-${r.status}`}>{r.status}</span>
            </div>
          ))}
        </section>
        <section>
          <div className="section-head"><h2>Recent orders</h2><Link to="/my-orders">All →</Link></div>
          {orders.length === 0 ? <p className="muted">None. <Link to="/restaurants">Order food</Link></p> : orders.slice(0, 3).map((o) => (
            <div className="card row-card" key={o._id}>
              <div>
                <strong>{o.restaurant?.name || 'Restaurant removed'}</strong>
                <p className="small">#{shortId(o._id)} · {formatDateTime(o.createdAt)} · {formatPrice(o.total)}</p>
              </div>
              <div className="row-actions">
                <span className={`badge badge-${o.status}`}>{o.status}</span>
                <Link to={`/orders/${o._id}`} className="btn btn-outline btn-sm">Track</Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
