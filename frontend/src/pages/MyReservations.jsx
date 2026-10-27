import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { errMsg, formatDate, formatTime, isPastSlot } from '../utils/helpers';

export default function MyReservations() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  useEffect(() => {
    api.get('/reservations/my')
      .then((res) => setItems(res.data.reservations))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (r) => {
    if (!window.confirm(`Cancel your reservation at ${r.restaurant?.name || 'this restaurant'}?`)) return;
    setError(''); setMessage('');
    try {
      const { data } = await api.patch(`/reservations/${r._id}/cancel`);
      setItems(items.map((x) => (x._id === r._id ? { ...x, status: data.reservation.status } : x)));
      setMessage('Reservation cancelled.');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      <h1>My reservations</h1>
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {items.length === 0 ? (
        <p className="muted">No reservations yet. <Link to="/restaurants">Find a restaurant</Link></p>
      ) : (
        <div className="list">
          {items.map((r) => {
            const past = isPastSlot(r.date, r.timeSlot);
            const canChange = r.status !== 'cancelled' && !past;
            return (
              <div className="card row-card" key={r._id}>
                <div>
                  <h3>{r.restaurant?.name || 'Restaurant removed'}</h3>
                  <p>{formatDate(r.date)} · {formatTime(r.timeSlot)} · {r.guests} guests · Table {r.table?.tableNumber || '-'}</p>
                  {r.notes && <p className="small muted">Note: {r.notes}</p>}
                </div>
                <div className="row-actions">
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                  {canChange && (
                    <>
                      <Link to={`/reservations/${r._id}/edit`} className="btn btn-outline btn-sm">Modify</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(r)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
