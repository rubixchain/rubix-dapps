import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function LoadingButton({ isLoading, onClick, children, className = '' }: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}