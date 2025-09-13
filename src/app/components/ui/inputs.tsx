// components/ui/inputs.tsx
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`input-field ${className || ''}`} // Combine base class with passed class
      {...props}
    />
  );
}