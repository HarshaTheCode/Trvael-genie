import React from "react";

export function ModernInput(props: any) {
  return (
    <input {...props} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '1rem', border: '1px solid #ccc', width: '100%' }} />
  );
}