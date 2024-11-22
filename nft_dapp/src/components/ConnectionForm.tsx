import React from 'react';
import { Globe, Wallet, Check } from 'lucide-react';

interface ConnectionFormProps {
  type: 'node' | 'wallet';
  onConnect: (value: string) => void;
  value: string;
  isConnected: boolean;
}

export default function ConnectionForm({ type, onConnect, value, isConnected }: ConnectionFormProps) {
  const [inputValue, setInputValue] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected && inputValue.trim()) {
      onConnect(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-center flex-1">
      <div className="flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={type === 'node' ? 'Enter Blockchain Node URL' : 'Enter Wallet Address'}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500"
          disabled={isConnected}
        />
      </div>
      <button
        type="submit"
        disabled={isConnected}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors whitespace-nowrap ${
          isConnected 
            ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isConnected ? (
          <>
            <Check size={20} />
            Connected
          </>
        ) : (
          <>
            {type === 'node' ? <Globe size={20} /> : <Wallet size={20} />}
            Connect {type === 'node' ? 'Node' : 'Wallet'}
          </>
        )}
      </button>
    </form>
  );
}
