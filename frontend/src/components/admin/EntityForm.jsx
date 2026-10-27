import { useState } from 'react';
import Alert from '../Alert';

// Small reusable form driven by a field list:
// { name, label, type: text|number|time|url|textarea|checkbox|select, required, options, min, max, default, wide }
export default function EntityForm({ title, fields, initial, onSubmit, onCancel, busy, error }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial?.[f.name] ?? f.default ?? (f.type === 'checkbox' ? false : '')])));
  const set = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const submit = (e) => {
    e.preventDefault();
    const out = { ...values };
    fields.forEach((f) => { if (f.type === 'number' && out[f.name] !== '') out[f.name] = Number(out[f.name]); });
    onSubmit(out);
  };

  return (
    <form className="card form admin-form" onSubmit={submit}>
      <h3>{title}</h3>
      <Alert>{error}</Alert>
      <div className="form-grid">
        {fields.map((f) => {
          if (f.type === 'checkbox') {
            return (
              <label key={f.name} className="check">
                <input type="checkbox" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}
              </label>
            );
          }
          return (
            <label key={f.name} className={f.wide ? 'wide' : ''}>{f.label}
              {f.type === 'textarea' ? (
                <textarea rows={2} required={f.required} maxLength={f.maxLength} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === 'select' ? (
                <select required={f.required} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} required={f.required} min={f.min} max={f.max} step={f.step}
                  maxLength={f.maxLength} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </label>
          );
        })}
      </div>
      <div className="row-actions">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
