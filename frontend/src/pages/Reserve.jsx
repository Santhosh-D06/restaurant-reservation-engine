import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { errMsg, formatTime, isPastSlot, todayString } from '../utils/helpers';

// Handles both "new reservation" (/restaurants/:id/reserve) and "modify" (/reservations/:reservationId/edit).
export default function Reserve() {
  const { id, reservationId } = useParams();
  const editing = Boolean(reservationId);
  const navigate = useNavigate();

  const [restaurantId, setRestaurantId] = useState(id || '');
  const [restaurant, setRestaurant] = useState(null);
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({ date: '', timeSlot: '', guests: 2, notes: '' });
  const [slots, setSlots] = useState([]);
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Load the restaurant (and the existing reservation when editing).
  useEffect(() => {
    (async () => {
      try {
        let rid = id;
        if (editing) {
          const { data } = await api.get(`/reservations/${reservationId}`);
          const r = data.reservation;
          rid = r.restaurant._id;
          setOriginal(r);
          setForm({ date: r.date, timeSlot: r.timeSlot, guests: r.guests, notes: r.notes || '' });
          setTableId(r.table._id);
        }
        setRestaurantId(rid);
        const [rest, av] = await Promise.all([
          api.get(`/restaurants/${rid}`),
          api.get(`/restaurants/${rid}/availability`),
        ]);
        setRestaurant(rest.data.restaurant);
        setSlots(av.data.slots);
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reservationId, editing]);

  // A table the customer already holds at the original slot stays selectable while editing.
  const isDisabled = (t) => {
    const mine = editing && original && form.date === original.date && form.timeSlot === original.timeSlot && t._id === original.table._id;
    return (t.booked && !mine) || !t.fits;
  };

  // Re-check table availability whenever date, time or guest count changes.
  useEffect(() => {
    if (!restaurantId || !form.date || !form.timeSlot) { setTables([]); return undefined; }
    let cancelled = false;
    setChecking(true);
    api.get(`/restaurants/${restaurantId}/availability`, { params: { date: form.date, timeSlot: form.timeSlot, guests: form.guests || 1 } })
      .then((res) => { if (!cancelled) { setTables(res.data.tables); setError(''); } })
      .catch((err) => { if (!cancelled) setError(errMsg(err)); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [restaurantId, form.date, form.timeSlot, form.guests]);

  // Drop a selection that is no longer valid.
  useEffect(() => {
    if (!tables.length || !tableId) return;
    const t = tables.find((x) => x._id === tableId);
    if (!t || isDisabled(t)) setTableId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const visibleSlots = slots.filter((s) => !form.date || !isPastSlot(form.date, s));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tableId) return setError('Please select a table');
    setBusy(true);
    const payload = { table: tableId, date: form.date, timeSlot: form.timeSlot, guests: Number(form.guests), notes: form.notes };
    try {
      if (editing) await api.put(`/reservations/${reservationId}`, payload);
      else await api.post('/reservations', { ...payload, restaurant: restaurantId });
      navigate('/my-reservations', {
        state: { message: editing ? 'Reservation updated. It is pending confirmation again.' : 'Reservation requested. It is pending until the restaurant confirms.' },
      });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (!restaurant) return <div className="container"><Alert>{error || 'Restaurant not found'}</Alert></div>;

  return (
    <div className="container narrow">
      <p><Link to={`/restaurants/${restaurantId}`}>← {restaurant.name}</Link></p>
      <h1>{editing ? 'Modify reservation' : 'Reserve a table'}</h1>
      <p className="muted">{restaurant.name} · open {formatTime(restaurant.openTime)} – {formatTime(restaurant.closeTime)}</p>

      <form className="card form" onSubmit={submit}>
        <Alert>{error}</Alert>
        <div className="row">
          <label>Date
            <input type="date" required min={todayString()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })} />
          </label>
          <label>Time
            <select required value={form.timeSlot} onChange={set('timeSlot')} disabled={!form.date}>
              <option value="">Select time</option>
              {visibleSlots.map((s) => <option key={s} value={s}>{formatTime(s)}</option>)}
            </select>
          </label>
          <label>Guests
            <input type="number" min="1" max="20" required value={form.guests} onChange={set('guests')} />
          </label>
        </div>

        <div>
          <strong>Choose a table</strong> {checking && <span className="small muted">checking...</span>}
          {!form.date || !form.timeSlot ? (
            <p className="small muted">Select a date and time to see tables.</p>
          ) : (
            <div className="table-grid">
              {tables.map((t) => {
                const disabled = isDisabled(t);
                return (
                  <button
                    type="button" key={t._id} disabled={disabled}
                    className={`table-btn ${tableId === t._id ? 'selected' : ''}`}
                    onClick={() => setTableId(t._id)}
                  >
                    <strong>{t.tableNumber}</strong>
                    <span>{t.capacity} seats</span>
                    <span className="small">{t.booked && disabled ? 'Booked' : !t.fits ? 'Too small' : 'Free'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <label>Notes (optional)
          <input maxLength={200} value={form.notes} onChange={set('notes')} placeholder="Birthday, high chair, etc." />
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Request reservation'}</button>
      </form>
    </div>
  );
}
