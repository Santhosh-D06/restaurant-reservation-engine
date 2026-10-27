import { useEffect, useState } from 'react';
import api from '../../api/axios';
import EntityForm from '../../components/admin/EntityForm';
import RestaurantPicker from '../../components/admin/RestaurantPicker';
import useRestaurants from '../../components/admin/useRestaurants';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg, formatPrice } from '../../utils/helpers';

const fields = [
  { name: 'name', label: 'Item name', required: true },
  { name: 'category', label: 'Category', required: true },
  { name: 'price', label: 'Price (₹)', type: 'number', min: 0, step: '1', required: true },
  { name: 'description', label: 'Description', maxLength: 300, wide: true },
  { name: 'isVeg', label: 'Vegetarian', type: 'checkbox', default: true },
  { name: 'isAvailable', label: 'Available', type: 'checkbox', default: true },
];

export default function AdminMenus() {
  const { restaurants, loading: loadingR } = useRestaurants();
  const [rid, setRid] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { if (!rid && restaurants.length) setRid(restaurants[0]._id); }, [restaurants, rid]);

  const load = () => api.get(`/restaurants/${rid}/menu`).then((r) => setItems(r.data.items)).catch((e) => setError(errMsg(e)));
  useEffect(() => { if (rid) { setForm(null); load(); } }, [rid]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (values) => {
    setBusy(true); setFormError('');
    try {
      if (form._id) await api.put(`/menus/${form._id}`, values);
      else await api.post('/menus', { ...values, restaurant: rid });
      setMessage(form._id ? 'Item updated.' : 'Item added.');
      setForm(null);
      await load();
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove ${item.name}?`)) return;
    setError(''); setMessage('');
    try { await api.delete(`/menus/${item._id}`); setMessage('Item removed.'); await load(); } catch (e) { setError(errMsg(e)); }
  };

  if (loadingR) return <Loader />;
  return (
    <>
      <div className="section-head">
        <h1>Menus</h1>
        <button className="btn btn-primary btn-sm" disabled={!rid} onClick={() => { setFormError(''); setForm({}); }}>+ Add item</button>
      </div>
      <RestaurantPicker restaurants={restaurants} value={rid} onChange={setRid} />
      <Alert type="success">{message}</Alert>
      <Alert>{error}</Alert>
      {form && <EntityForm key={form._id || 'new'} title={form._id ? 'Edit item' : 'New item'} fields={fields} initial={form} onSubmit={save} onCancel={() => setForm(null)} busy={busy} error={formError} />}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Veg</th><th>Available</th><th /></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id}>
                <td>{i.name}</td><td>{i.category}</td><td>{formatPrice(i.price)}</td><td>{i.isVeg ? 'Yes' : 'No'}</td><td>{i.isAvailable ? 'Yes' : 'No'}</td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => { setFormError(''); setForm(i); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
