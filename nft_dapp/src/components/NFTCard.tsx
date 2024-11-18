import React from 'react';
import { Send } from 'lucide-react';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  onTransfer: () => void;
}

export default function NFTCard({ id, name, image, onTransfer }: NFTCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-4">ID: {id}</p>
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