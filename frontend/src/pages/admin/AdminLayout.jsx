import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['/admin', 'Dashboard', true],
  ['/admin/restaurants', 'Restaurants'],
  ['/admin/menus', 'Menus'],
  ['/admin/tables', 'Tables'],
  ['/admin/reservations', 'Reservations'],
  ['/admin/orders', 'Orders'],
  ['/admin/customers', 'Customers'],
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        {links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
