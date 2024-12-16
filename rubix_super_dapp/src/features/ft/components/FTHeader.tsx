import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

type Props = {
  onCreateClick: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  isConfigured?: boolean;
};

export const FTHeader = ({ 
  onCreateClick, 
  onRefresh,
  isRefreshing = false,
  isLoading = false,
  isConfigured = false 
}: Props) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">FTs</h2>
        <button
          onClick={onRefresh}
          disabled={!isConfigured || isLoading}
          className="p-2 text-gray-600 hover:text-green-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Refresh FT list"
        >
          <RefreshCw 
            size={20} 
            className={`${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white transition-colors whitespace-nowrap"
      >
        <Plus className="h-4 w-4" />
        Create FT
      </button>
    </div>
  );
};
