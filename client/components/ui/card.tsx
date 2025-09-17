import React from 'react';

function CardComponent({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={["card", className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export default CardComponent;

export function CardHeader({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={["card-header", className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={["card-content", className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 {...rest} className={["card-title", className].filter(Boolean).join(' ')}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={["card-description", className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

