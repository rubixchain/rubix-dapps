import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FTFormData } from '../types/ft';

type Props = {
  onSubmit: (data: FTFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
};

export const CreateFTForm = ({ 
  onSubmit, 
  isLoading = false, 
  error = null, 
  success = null 
}: Props) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');
  const [rbtLocked, setRbtLocked] = useState('');
  const [creatorDid, setCreatorDid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      tokenName,
      tokenSupply,
      rbtLocked,
      creatorDid
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-lg flex items-center">
          <CheckCircle2 className="text-green-500 mr-2" size={20} />
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700">
            Token Name
          </label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="e.g., My FT Token"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tokenSupply" className="block text-sm font-medium text-gray-700">
            Token Supply
          </label>
          <input
            id="tokenSupply"
            type="number"
            value={tokenSupply}
            onChange={(e) => setTokenSupply(e.target.value)}
            placeholder="Enter total supply"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="rbtLocked" className="block text-sm font-medium text-gray-700">
            No. of RBT to be locked
          </label>
          <input
            id="rbtLocked"
            type="number"
            value={rbtLocked}
            onChange={(e) => setRbtLocked(e.target.value)}
            placeholder="Enter RBT amount"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="creatorDid" className="block text-sm font-medium text-gray-700">
            Creator DID
          </label>
          <input
            id="creatorDid"
            type="text"
            value={creatorDid}
            onChange={(e) => setCreatorDid(e.target.value)}
            placeholder="Enter your DID"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || success !== null}
        >
          {isLoading ? 'Creating FT...' : success ? 'FT Created' : 'Create FT'}
        </button>
      </form>
    </div>
  );
};
