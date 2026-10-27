import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg, formatDate, formatTime } from '../../utils/helpers';

export default function AdminReservations() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/reservations', { params: { status: status || undefined } })
      .then((r) => { setItems(r.data.reservations); setError(''); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [status]);

  const update = async (r, next) => {
    setError(''); setMessage('');
    try {
      const { data } = await api.patch(`/reservations/${r._id}/status`, { status: next });
      setItems(items.map((x) => (x._id === r._id ? { ...x, status: data.reservation.status } : x)));
      setMessage(`Reservation ${next}.`);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <div className="section-head">
        <h1>Reservations</h1>
        <select className="inline-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {loading ? <Loader /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Customer</th><th>Restaurant</th><th>When</th><th>Table</th><th>Guests</th><th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.name}<div className="small muted">{r.user?.email}</div></td>
                  <td>{r.restaurant?.name}</td>
                  <td>{formatDate(r.date)}<div className="small muted">{formatTime(r.timeSlot)}</div></td>
                  <td>{r.table?.tableNumber}</td><td>{r.guests}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td className="actions">
                    {r.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => update(r, 'confirmed')}>Approve</button>}
                    {r.status !== 'cancelled' && <button className="btn btn-danger btn-sm" onClick={() => update(r, 'cancelled')}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="muted">No reservations.</p>}
        </div>
      )}
    </>
  );
}
