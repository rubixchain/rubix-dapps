import React from 'react';
import { Send } from 'lucide-react';
import type { NFT } from '../types/nft';

interface NFTCardProps extends NFT {
  onTransfer: () => void;
}

export default function NFTCard({ nft, owner_did, nft_value, onTransfer }: NFTCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-50 p-4 flex items-center justify-center">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/6298/6298900.png"
          alt="NFT Placeholder"
          className="w-28 h-28 object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-4 bg-white">
        <div className="space-y-2.5 mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-0.5">NFT ID</h3>
            <p className="text-sm text-gray-900 break-all font-mono bg-gray-50 p-1.5 rounded">
              {nft}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-0.5">Owner</h3>
            <p className="text-sm text-gray-900 break-all font-mono bg-gray-50 p-1.5 rounded">
              {owner_did}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-0.5">Value</h3>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-1.5 rounded">
              {nft_value}
            </p>
          </div>
        </div>
        <button
          onClick={onTransfer}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium text-sm"
        >
          <Send size={16} />
          Transfer NFT
        </button>
      </div>
    </div>
  );
}
