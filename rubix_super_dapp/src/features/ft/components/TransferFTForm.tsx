import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransferFTFormData {
  tokenName: string;
  amount: string;
  creatorDid: string;
  receiverDid: string;
}

type Props = {
  onSubmit: (data: TransferFTFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  initialTokenName?: string;
  initialCreatorDid?: string;
};

export const TransferFTForm = ({ 
  onSubmit, 
  isLoading = false, 
  error = null, 
  success = null,
  initialTokenName = '',
  initialCreatorDid = ''
}: Props) => {
  const [tokenName, setTokenName] = useState(initialTokenName);
  const [amount, setAmount] = useState('');
  const [creatorDid, setCreatorDid] = useState(initialCreatorDid);
  const [receiverDid, setReceiverDid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tokenName,
      amount,
      creatorDid,
      receiverDid
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            required
            disabled={isLoading || Boolean(initialTokenName)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount to Transfer
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to transfer"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            required
            disabled={isLoading || Boolean(initialCreatorDid)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="receiverDid" className="block text-sm font-medium text-gray-700">
            Receiver DID
          </label>
          <input
            id="receiverDid"
            type="text"
            value={receiverDid}
            onChange={(e) => setReceiverDid(e.target.value)}
            placeholder="Enter receiver's DID"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || success !== null}
        >
          {isLoading ? 'Transferring...' : success ? 'Transfer Complete' : 'Transfer FT'}
        </button>
      </form>
    </div>
  );
};
