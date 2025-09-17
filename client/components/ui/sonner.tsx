import React from 'react';

// Minimal Toaster shim: renders a container where toast UI can be mounted if needed.
export const Toaster: React.FC = () => {
	return <div aria-live="polite" id="app-toaster" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }} />;
};

export default Toaster;
