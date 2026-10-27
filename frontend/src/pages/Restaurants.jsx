import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { errMsg } from '../utils/helpers';

export default function Restaurants() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [cuisine, setCuisine] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('name');
  const [list, setList] = useState([]);
  const [options, setOptions] = useState({ cuisines: [], cities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter dropdown options come from the unfiltered list.
  useEffect(() => {
    api.get('/restaurants').then((res) => {
      const rs = res.data.restaurants;
      setOptions({
        cuisines: [...new Set(rs.map((r) => r.cuisine))].sort(),
        cities: [...new Set(rs.map((r) => r.city))].sort(),
      });
    }).catch(() => {});
  }, []);

  // Search/filter on the server, debounced while typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/restaurants', { params: { q: q || undefined, cuisine: cuisine || undefined, city: city || undefined, sort } })
        .then((res) => { setList(res.data.restaurants); setError(''); })
        .catch((err) => setError(errMsg(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q, cuisine, city, sort]);

  return (
    <div className="container">
      <h1>Restaurants</h1>
      <div className="filters">
        <input placeholder="Search name, cuisine, city..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label="Cuisine">
          <option value="">All cuisines</option>
          {options.cuisines.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
          <option value="">All cities</option>
          {options.cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="name">Name A–Z</option>
          <option value="-name">Name Z–A</option>
        </select>
      </div>
      <Alert>{error}</Alert>
      {loading ? <Loader /> : list.length === 0 ? (
        <p className="muted">No restaurants match your search.</p>
      ) : (
        <div className="grid cards">{list.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}</div>
      )}
    </div>
  );
}
