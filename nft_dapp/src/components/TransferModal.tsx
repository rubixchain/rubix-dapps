import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (recipient: string, value: number) => void;
  isConfigured: boolean;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export default function TransferModal({ 
  isOpen, 
  onClose, 
  onTransfer, 
  isConfigured,
  isLoading = false,
  error = null,
  success = false
}: TransferModalProps) {
  const [recipient, setRecipient] = React.useState('');
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (success) {
      // Auto close after showing success message
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || isLoading) return;
    onTransfer(recipient, parseFloat(value));
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle size={48} className="text-yellow-500" />
            <p className="text-center text-gray-600">
              Please connect both node and wallet to transfer NFTs
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-center text-gray-600">
              NFT Transfer Successful!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Transfer NFT</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
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
              placeholder="Enter recipient address"
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              'Confirm Transfer'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
