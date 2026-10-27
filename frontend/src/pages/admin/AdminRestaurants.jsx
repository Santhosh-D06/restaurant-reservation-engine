import { useEffect, useState } from 'react';
import api from '../../api/axios';
import EntityForm from '../../components/admin/EntityForm';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg, formatTime } from '../../utils/helpers';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'cuisine', label: 'Cuisine', required: true },
  { name: 'city', label: 'City', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Address', required: true, wide: true },
  { name: 'openTime', label: 'Opens', type: 'time', default: '11:00', required: true },
  { name: 'closeTime', label: 'Closes', type: 'time', default: '22:00', required: true },
  { name: 'image', label: 'Image URL (optional)', type: 'url', wide: true },
  { name: 'description', label: 'Description', type: 'textarea', maxLength: 500, wide: true },
];

export default function AdminRestaurants() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = hidden, {} = new, object = editing
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => api.get('/restaurants').then((r) => setItems(r.data.restaurants)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async (values) => {
    setBusy(true); setFormError('');
    try {
      if (form._id) await api.put(`/restaurants/${form._id}`, values);
      else await api.post('/restaurants', values);
      setMessage(form._id ? 'Restaurant updated.' : 'Restaurant added.');
      setForm(null);
      await load();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.name}? Its menu and tables are removed and active reservations are cancelled.`)) return;
    setError(''); setMessage('');
    try {
      await api.delete(`/restaurants/${r._id}`);
      setMessage('Restaurant deleted.');
      await load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (loading) return <Loader />;
  return (
    <>
      <div className="section-head"><h1>Restaurants</h1><button className="btn btn-primary btn-sm" onClick={() => { setFormError(''); setForm({}); }}>+ Add restaurant</button></div>
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {form && <EntityForm key={form._id || 'new'} title={form._id ? 'Edit restaurant' : 'New restaurant'} fields={fields} initial={form} onSubmit={save} onCancel={() => setForm(null)} busy={busy} error={formError} />}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Cuisine</th><th>City</th><th>Hours</th><th /></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td><td>{r.cuisine}</td><td>{r.city}</td><td>{formatTime(r.openTime)} – {formatTime(r.closeTime)}</td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => { setFormError(''); setForm(r); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
