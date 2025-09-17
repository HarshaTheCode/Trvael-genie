
import React from "react";

export function ModernCheckbox({ label, ...props }: any) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
      <input type="checkbox" {...props} />
      {props.checked && <span style={{ color: '#2563eb', fontSize: '1.2em' }}>✔️</span>}
      {label}
    </label>
  );
}