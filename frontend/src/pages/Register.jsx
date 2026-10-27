import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { errMsg } from '../utils/helpers';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card form" onSubmit={submit}>
        <h2>Create account</h2>
        <Alert>{error}</Alert>
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Phone (optional)<input value={form.phone} onChange={set('phone')} /></label>
        <label>Password (min 6 characters)<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        <label>Confirm password<input type="password" required value={form.confirm} onChange={set('confirm')} /></label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        <p className="small">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
