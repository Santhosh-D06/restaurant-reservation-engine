import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import { errMsg, formatDateTime } from '../../utils/helpers';

export default function AdminCustomers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/customers').then((r) => setItems(r.data.customers)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  return (
    <>
      <h1>Customers</h1>
      <Alert>{error}</Alert>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Reservations</th><th>Orders</th><th>Joined</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td><td>{c.email}</td><td>{c.phone || '-'}</td>
                <td>{c.reservationCount}</td><td>{c.orderCount}</td><td>{formatDateTime(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
