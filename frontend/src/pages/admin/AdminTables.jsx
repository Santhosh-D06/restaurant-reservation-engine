import { useEffect, useState } from 'react';
import api from '../../api/axios';
import EntityForm from '../../components/admin/EntityForm';
import RestaurantPicker from '../../components/admin/RestaurantPicker';
import useRestaurants from '../../components/admin/useRestaurants';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg } from '../../utils/helpers';

const fields = [
  { name: 'tableNumber', label: 'Table number', required: true },
  { name: 'capacity', label: 'Capacity (guests)', type: 'number', min: 1, max: 20, required: true },
  { name: 'isAvailable', label: 'Available for booking', type: 'checkbox', default: true },
];

export default function AdminTables() {
  const { restaurants, loading: loadingR } = useRestaurants();
  const [rid, setRid] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { if (!rid && restaurants.length) setRid(restaurants[0]._id); }, [restaurants, rid]);

  const load = () => api.get(`/restaurants/${rid}/tables`).then((r) => setItems(r.data.tables)).catch((e) => setError(errMsg(e)));
  useEffect(() => { if (rid) { setForm(null); load(); } }, [rid]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (values) => {
    setBusy(true); setFormError('');
    try {
      if (form._id) await api.put(`/tables/${form._id}`, values);
      else await api.post('/tables', { ...values, restaurant: rid });
      setMessage(form._id ? 'Table updated.' : 'Table added.');
      setForm(null);
      await load();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (t) => {
    setError(''); setMessage('');
    try { await api.put(`/tables/${t._id}`, { isAvailable: !t.isAvailable }); await load(); } catch (e) { setError(errMsg(e)); }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete table ${t.tableNumber}?`)) return;
    setError(''); setMessage('');
    try { await api.delete(`/tables/${t._id}`); setMessage('Table removed.'); await load(); } catch (e) { setError(errMsg(e)); }
  };

  if (loadingR) return <Loader />;
  return (
    <>
      <div className="section-head">
        <h1>Tables</h1>
        <button className="btn btn-primary btn-sm" disabled={!rid} onClick={() => { setFormError(''); setForm({}); }}>+ Add table</button>
      </div>
      <RestaurantPicker restaurants={restaurants} value={rid} onChange={setRid} />
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {form && <EntityForm key={form._id || 'new'} title={form._id ? 'Edit table' : 'New table'} fields={fields} initial={form} onSubmit={save} onCancel={() => setForm(null)} busy={busy} error={formError} />}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Table</th><th>Capacity</th><th>Available</th><th /></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td>{t.tableNumber}</td><td>{t.capacity}</td><td>{t.isAvailable ? 'Yes' : 'No'}</td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => toggle(t)}>{t.isAvailable ? 'Disable' : 'Enable'}</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setFormError(''); setForm(t); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
