import React from 'react';
import { X } from 'lucide-react';
import LoadingButton from './LoadingButton';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (recipient: string, value: number) => void;
  isLoading: boolean;
}

export default function TransferModal({ isOpen, onClose, onTransfer, isLoading }: TransferModalProps) {
  const [recipient, setRecipient] = React.useState('');
  const [value, setValue] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransfer(recipient, parseFloat(value));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Transfer NFT</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="0x..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NFT Value
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            Confirm Transfer
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}