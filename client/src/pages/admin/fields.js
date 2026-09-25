import React from 'react';
import ImageUpload from './ImageUpload';

// Every field receives `form` = { data, onChange, setField } from the Admin page

export const LIST_HINT = 'Separate with | (pipe character)';

export function Field({ label, name, form, textarea = false, hint, ...inputProps }) {
  const Input = textarea ? 'textarea' : 'input';
  return (
    <div className="form-group">
      <label>{label}</label>
      <Input
        type={textarea ? undefined : 'text'}
        name={name}
        value={form.data[name] ?? ''}
        onChange={form.onChange}
        {...inputProps}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}

// Pipe-separated list, edited as text and converted to an array on save
export function ListField(props) {
  return <Field hint={LIST_HINT} {...props} />;
}

export function SelectField({ label, name, form, options }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} value={form.data[name] ?? ''} onChange={form.onChange}>
        {options.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ label, name, form }) {
  return (
    <div className="form-group checkbox">
      <label>
        <input type="checkbox" name={name} checked={Boolean(form.data[name])} onChange={form.onChange} />
        {label}
      </label>
    </div>
  );
}

export function ImageField({ label, name, folder, form }) {
  return (
    <ImageUpload
      value={form.data[name]}
      onChange={(url) => form.setField(name, url)}
      folder={folder}
      label={label}
    />
  );
}

export function DateRange({ form, required = false }) {
  return (
    <div className="form-row">
      <Field label={`Start Date${required ? ' *' : ''}`} name="startDate" form={form} required={required} placeholder="January 2024" />
      <Field label={`End Date${required ? ' *' : ''}`} name="endDate" form={form} required={required} placeholder="Present" />
    </div>
  );
}
