import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { ORDER_STATUSES, errMsg, formatDateTime, formatPrice, shortId } from '../../utils/helpers';

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/orders', { params: { status: status || undefined } })
      .then((r) => { setItems(r.data.orders); setError(''); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [status]);

  const update = async (o, next) => {
    setError(''); setMessage('');
    try {
      const { data } = await api.patch(`/orders/${o._id}/status`, { status: next });
      setItems(items.map((x) => (x._id === o._id ? { ...x, status: data.order.status } : x)));
      setMessage(`Order #${shortId(o._id)} is now ${next}.`);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <div className="section-head">
        <h1>Orders</h1>
        <select className="inline-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {loading ? <Loader /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Restaurant</th><th>Items</th><th>Total</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((o) => {
                const done = ['delivered', 'cancelled'].includes(o.status);
                return (
                  <tr key={o._id}>
                    <td>#{shortId(o._id)}<div className="small muted">{formatDateTime(o.createdAt)}</div></td>
                    <td>{o.user?.name}</td>
                    <td>{o.restaurant?.name}</td>
                    <td className="small">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td>{o.orderType}</td>
                    <td>
                      <select className="inline-select" value={o.status} disabled={done} onChange={(e) => update(o, e.target.value)} aria-label="Order status">
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && <p className="muted">No orders.</p>}
        </div>
      )}
    </>
  );
}
