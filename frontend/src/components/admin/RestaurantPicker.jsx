export default function RestaurantPicker({ restaurants, value, onChange }) {
  return (
    <label className="picker">Restaurant
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
      </select>
    </label>
  );
}
