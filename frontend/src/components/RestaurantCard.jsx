import { Link } from 'react-router-dom';
import { formatTime } from '../utils/helpers';

export default function RestaurantCard({ restaurant: r }) {
  return (
    <article className="card restaurant-card">
      {r.image ? (
        <img src={r.image} alt={r.name} className="card-img" />
      ) : (
        <div className="card-img placeholder">{r.name.charAt(0)}</div>
      )}
      <div className="card-body">
        <h3>{r.name}</h3>
        <p className="muted">{r.cuisine} · {r.city}</p>
        <p className="small">🕒 {formatTime(r.openTime)} – {formatTime(r.closeTime)}</p>
        <p className="small desc">{r.description}</p>
        <div className="card-actions">
          <Link to={`/restaurants/${r._id}`} className="btn btn-outline btn-sm">View menu</Link>
          <Link to={`/restaurants/${r._id}/reserve`} className="btn btn-primary btn-sm">Reserve</Link>
        </div>
      </div>
    </article>
  );
}
