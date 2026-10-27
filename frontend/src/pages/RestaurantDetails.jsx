import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { useCart } from '../context/CartContext';
import { errMsg, formatPrice, formatTime } from '../utils/helpers';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { cart, addItem, changeQty, subtotal, count } = useCart();
  const qty = (itemId) => cart.items.find((i) => i.menuItem === itemId)?.quantity || 0;
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/restaurants/${id}/menu`),
      api.get(`/restaurants/${id}/tables`),
    ])
      .then(([r, m, t]) => {
        setRestaurant(r.data.restaurant);
        setMenu(m.data.items);
        setTables(t.data.tables);
      })
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="container"><Alert>{error}</Alert></div>;

  const byCategory = menu.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="container">
      <div className="detail-head">
        {restaurant.image
          ? <img src={restaurant.image} alt={restaurant.name} className="detail-img" />
          : <div className="detail-img placeholder">{restaurant.name.charAt(0)}</div>}
        <div>
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.cuisine} · {restaurant.city}</p>
          <p>{restaurant.description}</p>
          <p className="small">📍 {restaurant.address}</p>
          {restaurant.phone && <p className="small">📞 {restaurant.phone}</p>}
          <p className="small">🕒 Open {formatTime(restaurant.openTime)} – {formatTime(restaurant.closeTime)}</p>
          <p className="small">🪑 {tables.filter((t) => t.isAvailable).length} tables (seating {tables.length ? `${Math.min(...tables.map((t) => t.capacity))}–${Math.max(...tables.map((t) => t.capacity))}` : '-'} guests)</p>
          <Link to={`/restaurants/${id}/reserve`} className="btn btn-primary">Reserve a table</Link>
        </div>
      </div>

      <div className="section-head">
        <h2>Menu</h2>
        {count > 0 && <Link to="/cart" className="btn btn-outline btn-sm">🛒 View cart ({count}) · {formatPrice(subtotal)}</Link>}
      </div>
      {menu.length === 0 && <p className="muted">No menu items yet.</p>}
      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category}>
          <h3 className="category">{category}</h3>
          <div className="grid menu-grid">
            {items.map((item) => (
              <div className="card menu-item" key={item._id}>
                <div>
                  <span className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'} />
                  <strong>{item.name}</strong>
                  {item.description && <p className="small muted">{item.description}</p>}
                  {!item.isAvailable && <p className="small muted">Currently unavailable</p>}
                </div>
                <div className="item-side">
                  <span className="price">{formatPrice(item.price)}</span>
                  {item.isAvailable && (qty(item._id) === 0 ? (
                    <button className="btn btn-primary btn-sm" onClick={() => addItem(restaurant, item)}>Add</button>
                  ) : (
                    <div className="qty">
                      <button onClick={() => changeQty(item._id, -1)} aria-label="Decrease quantity">−</button>
                      <span>{qty(item._id)}</span>
                      <button onClick={() => changeQty(item._id, 1)} aria-label="Increase quantity">+</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
