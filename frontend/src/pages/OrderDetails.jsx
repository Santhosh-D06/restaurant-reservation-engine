import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { ORDER_STEPS, errMsg, formatDateTime, formatPrice, shortId } from '../utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  const load = useCallback(() =>
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(errMsg(err))), [id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  // Refresh every 10 seconds while the order is still in progress, so status changes show up.
  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order.status)) return undefined;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [order, load]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setError(''); setMessage('');
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      setOrder({ ...order, status: data.order.status });
      setMessage('Order cancelled.');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="container"><Alert>{error || 'Order not found'}</Alert></div>;

  const stepIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <div className="container narrow">
      <p><Link to="/my-orders">← My orders</Link></p>
      <h1>Order #{shortId(order._id)}</h1>
      <p className="muted">{order.restaurant?.name || 'Restaurant removed'} · {formatDateTime(order.createdAt)} · {order.orderType}</p>
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>

      <div className="card" style={{ padding: 20 }}>
        <h3>Order status</h3>
        {order.status === 'cancelled' ? (
          <span className="badge badge-cancelled">cancelled</span>
        ) : (
          <ol className="tracker">
            {ORDER_STEPS.map((s, i) => (
              <li key={s} className={i < stepIndex ? 'done' : i === stepIndex ? 'current' : ''}>
                <span className="dot" />{s}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {order.items.map((i) => (
          <div className="cart-line simple" key={i.menuItem}>
            <span>{i.name} × {i.quantity}</span>
            <strong>{formatPrice(i.price * i.quantity)}</strong>
          </div>
        ))}
        <div className="cart-total"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        <div className="cart-total grand"><span>Total</span><span>{formatPrice(order.total)}</span></div>
      </div>
      {order.deliveryAddress && <p className="small">Delivery address: {order.deliveryAddress}</p>}
      <p className="small muted">Payment: demonstration only (simulated). No real payment was processed.</p>
      {order.status === 'placed' && <button className="btn btn-danger" onClick={cancel}>Cancel order</button>}
    </div>
  );
}
