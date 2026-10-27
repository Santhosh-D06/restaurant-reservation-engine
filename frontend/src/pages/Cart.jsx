import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Alert from '../components/Alert';
import { errMsg, formatPrice } from '../utils/helpers';

export default function Cart() {
  const { cart, subtotal, changeQty, removeItem, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('pickup');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!cart.items.length) {
    return (
      <div className="container">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty. <Link to="/restaurants">Browse restaurants</Link></p>
      </div>
    );
  }

  const place = async () => {
    setError('');
    if (!user) return navigate('/login', { state: { from: '/cart' } });
    if (user.role !== 'customer') return setError('Only customer accounts can place orders');
    if (orderType === 'delivery' && !address.trim()) return setError('Please enter a delivery address');
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        restaurant: cart.restaurant._id,
        items: cart.items.map(({ menuItem, quantity }) => ({ menuItem, quantity })),
        orderType,
        deliveryAddress: address,
      });
      clear();
      navigate(`/orders/${data.order._id}`, { state: { message: 'Order placed! Demo payment only: no real payment was processed.' } });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Your cart</h1>
      <p className="muted">From {cart.restaurant.name}</p>
      <div className="card">
        {cart.items.map((i) => (
          <div className="cart-line" key={i.menuItem}>
            <div><strong>{i.name}</strong><div className="small muted">{formatPrice(i.price)} each</div></div>
            <div className="qty">
              <button onClick={() => changeQty(i.menuItem, -1)} aria-label="Decrease quantity">−</button>
              <span>{i.quantity}</span>
              <button onClick={() => changeQty(i.menuItem, 1)} aria-label="Increase quantity">+</button>
            </div>
            <strong className="line-total">{formatPrice(i.price * i.quantity)}</strong>
            <button className="link-btn" onClick={() => removeItem(i.menuItem)}>Remove</button>
          </div>
        ))}
        <div className="cart-total"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="cart-total grand"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
      </div>

      <div className="card form" style={{ marginTop: 16 }}>
        <strong>Order type</strong>
        <label className="check"><input type="radio" checked={orderType === 'pickup'} onChange={() => setOrderType('pickup')} /> Pickup</label>
        <label className="check"><input type="radio" checked={orderType === 'delivery'} onChange={() => setOrderType('delivery')} /> Delivery</label>
        {orderType === 'delivery' && (
          <label>Delivery address<input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} /></label>
        )}
        <Alert>{error}</Alert>
        <p className="small muted">Payment: <strong>demonstration only</strong>. No real payment is taken.</p>
        <button className="btn btn-primary" onClick={place} disabled={busy}>
          {busy ? 'Placing order...' : user ? `Place order (demo payment) · ${formatPrice(subtotal)}` : 'Login to place order'}
        </button>
        <button className="btn btn-outline" onClick={clear} disabled={busy}>Clear cart</button>
      </div>
    </div>
  );
}
