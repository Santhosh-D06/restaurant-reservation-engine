import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { errMsg, formatDateTime, formatPrice, shortId } from '../utils/helpers';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="container">
      <h1>My orders</h1>
      <Alert>{error}</Alert>
      {orders.length === 0 ? (
        <p className="muted">No orders yet. <Link to="/restaurants">Order some food</Link></p>
      ) : (
        <div className="list">
          {orders.map((o) => (
            <div className="card row-card" key={o._id}>
              <div>
                <h3>{o.restaurant?.name || 'Restaurant removed'} <span className="muted small">#{shortId(o._id)}</span></h3>
                <p className="small muted">{formatDateTime(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items · {o.orderType}</p>
                <strong>{formatPrice(o.total)}</strong>
              </div>
              <div className="row-actions">
                <span className={`badge badge-${o.status}`}>{o.status}</span>
                <Link to={`/orders/${o._id}`} className="btn btn-outline btn-sm">Details & tracking</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
