import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';
import Loader from '../components/Loader';

export default function Home() {
  const [q, setQ] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/restaurants')
      .then((res) => setFeatured(res.data.restaurants.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/restaurants?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Reserve a table. Order your favourites.</h1>
        <p>Find restaurants, book a table for your group and order food online, all in one place.</p>
        <form className="hero-search" onSubmit={search}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by restaurant, cuisine or city" aria-label="Search restaurants" />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </section>

      <section className="container">
        <h2>How it works</h2>
        <div className="grid steps">
          <div className="card step"><span>1</span><h3>Find</h3><p>Browse restaurants and their menus.</p></div>
          <div className="card step"><span>2</span><h3>Book</h3><p>Pick a date, time and an available table.</p></div>
          <div className="card step"><span>3</span><h3>Enjoy</h3><p>Manage your reservations from your account.</p></div>
        </div>

        <div className="section-head">
          <h2>Featured restaurants</h2>
          <Link to="/restaurants">See all →</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid cards">
            {featured.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
          </div>
        )}
      </section>
    </>
  );
}
