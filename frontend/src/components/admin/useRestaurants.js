import { useEffect, useState } from 'react';
import api from '../../api/axios';

// Loads all restaurants for the "pick a restaurant" dropdowns in the admin pages.
export default function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/restaurants').then((r) => setRestaurants(r.data.restaurants)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { restaurants, loading };
}
