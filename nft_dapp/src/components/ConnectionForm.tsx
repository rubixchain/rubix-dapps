import React from 'react';
import { Globe, Wallet, Check, Edit2 } from 'lucide-react';

interface ConnectionFormProps {
  type: 'node' | 'wallet';
  onConnect: (value: string) => void;
  onDisconnect: () => void;
  value: string;
  isConnected: boolean;
}

export default function ConnectionForm({ type, onConnect, onDisconnect, value, isConnected }: ConnectionFormProps) {
  const [inputValue, setInputValue] = React.useState(value);
  
  // Update input value when prop changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onConnect(inputValue.trim());
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setInputValue('');
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
      {isConnected ? (
        <button
          type="button"
          onClick={handleDisconnect}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-red-600 text-white transition-colors whitespace-nowrap"
        >
          <Check size={20} />
          Connected
        </button>
      ) : (
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap"
        >
          {type === 'node' ? <Globe size={20} /> : <Wallet size={20} />}
          Connect {type === 'node' ? 'Node' : 'Wallet'}
        </button>
      )}
    </form>
  );
}
