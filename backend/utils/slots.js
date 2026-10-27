// Reservation slots are 1 hour long, starting on the hour between opening and closing time.
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const generateSlots = (openTime, closeTime) => {
  const slots = [];
  for (let t = toMinutes(openTime); t + 60 <= toMinutes(closeTime); t += 60) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
};

const todayString = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

// True if the given date (YYYY-MM-DD) + slot (HH:MM) is already in the past.
const isPast = (date, timeSlot) => {
  const today = todayString();
  if (date < today) return true;
  return date === today && toMinutes(timeSlot) <= nowMinutes();
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { toMinutes, generateSlots, todayString, isPast, escapeRegex };
