import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>🍽️ TableEase</Link>
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/restaurants" onClick={close}>Restaurants</NavLink>
          {user?.role === 'customer' && (
            <>
              <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
              <NavLink to="/my-reservations" onClick={close}>Reservations</NavLink>
              <NavLink to="/my-orders" onClick={close}>Orders</NavLink>
            </>
          )}
          {user?.role !== 'admin' && <NavLink to="/cart" onClick={close}>🛒 Cart{count > 0 ? ` (${count})` : ''}</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={close}>Admin panel</NavLink>}
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
