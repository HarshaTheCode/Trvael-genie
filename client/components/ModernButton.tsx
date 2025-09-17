
import React from "react";

export function ModernButton({ loading, children, ...props }: any) {
  return (
    <button {...props} disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', opacity: props.disabled ? 0.5 : 1 }}>
      {loading && <span role="status" aria-label="Loading" style={{ marginRight: 8 }}>⏳</span>}
      {children}
    </button>
  );
}