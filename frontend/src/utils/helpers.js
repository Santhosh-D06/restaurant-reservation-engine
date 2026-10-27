export const errMsg = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatTime = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const formatDate = (yyyymmdd) => {
  if (!yyyymmdd) return '';
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatPrice = (n) => `₹${Number(n).toFixed(0)}`;

// True if date (YYYY-MM-DD) + slot (HH:MM) is not in the future.
export const isPastSlot = (date, timeSlot) => {
  const today = todayString();
  if (date < today) return true;
  if (date > today) return false;
  const [h, m] = timeSlot.split(':').map(Number);
  const now = new Date();
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
};

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const ORDER_STEPS = ['placed', 'confirmed', 'preparing', 'ready', 'delivered'];
export const ORDER_STATUSES = [...ORDER_STEPS, 'cancelled'];
export const shortId = (id) => String(id).slice(-6).toUpperCase();
