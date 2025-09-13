// components/ui/buttons.tsx
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`primary-button ${className || ''}`} // Combine base class with passed class
      {...props}
    >
      {children}
    </button>
  );
}