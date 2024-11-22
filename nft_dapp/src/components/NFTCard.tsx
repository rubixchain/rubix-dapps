import React from 'react';
import { Send } from 'lucide-react';
import type { NFT } from '../types/nft';

interface NFTCardProps extends NFT {
  onTransfer: () => void;
}

export default function NFTCard({ id, owner, onTransfer }: NFTCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">NFT #{id}</h3>
        <p className="text-sm text-gray-600 mb-4">Owner: {owner}</p>
        <button
          onClick={onTransfer}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Send size={18} />
          Transfer NFT
        </button>
      </div>
    </div>
  );
}