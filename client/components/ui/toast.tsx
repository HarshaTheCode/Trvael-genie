import React from 'react';
import { useToast } from '../../hooks/use-toast';

// Keep the types broad to match existing usage across the app.
export type ToastActionElement = React.ReactNode;
export type ToastProps = {
	id?: string;
	title?: React.ReactNode;
	description?: React.ReactNode;
	open?: boolean;
	action?: ToastActionElement;
	onOpenChange?: (open: boolean) => void;
};

// Single Toast visual component
export const Toast: React.FC<ToastProps> = ({ title, description, action, id }) => {
	return (
		<div role="status" aria-live="polite" className="max-w-sm w-full bg-white shadow-md border rounded-md p-3 text-sm">
			<div className="flex items-start gap-3">
				<div className="flex-1">
					{title && <div className="font-semibold text-gray-900">{title}</div>}
					{description && <div className="text-gray-600 mt-1">{description}</div>}
				</div>
				{action && <div className="ml-2">{action}</div>}
			</div>
		</div>
	);
};

// Toaster container that subscribes to the in-repo toast state (use-toast)
export const ToasterContainer: React.FC = () => {
		const { toasts, dismiss } = useToast();

	return (
		<div aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
			{toasts.map((t: any) => (
				<div key={t.id} className="flex items-center gap-3">
					<Toast
						id={t.id}
						title={t.title}
						description={t.description}
						action={t.action}
					/>
					<button
						onClick={() => dismiss(t.id)}
						aria-label="Dismiss toast"
						className="text-gray-500 hover:text-gray-700 px-2"
					>
						✖️
					</button>
				</div>
			))}
		</div>
	);
};

export default Toast;
