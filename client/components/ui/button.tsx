import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  asChild?: boolean; // kept for compatibility with callers
};

function ButtonComponent({ children, variant, size, asChild, className, ...rest }: ButtonProps) {
  // Simple styling helper: map variant/size to className-friendly strings
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : '';
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button {...rest} className={[variantClass, sizeClass, className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}

export const Button = ButtonComponent;
export default ButtonComponent;
