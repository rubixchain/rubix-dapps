import React from 'react';
import { FTList } from './FTList';
import { FTHeader } from './FTHeader';
import type { FTInfo } from '../services/api';

type Props = {
  onCreateClick: () => void;
  onRefresh: () => void;
  onTransfer: (data: {
    tokenName: string;
    amount: string;
    creatorDid: string;
    receiverDid: string;
  }) => Promise<void>;
  fts: FTInfo[];
  isTransferring?: boolean;
  isRefreshing?: boolean;
  isLoading?: boolean;
  isConfigured?: boolean;
};

export const FTDashboard = ({ 
  onCreateClick, 
  onRefresh,
  onTransfer,
  fts,
  isTransferring,
  isRefreshing,
  isLoading,
  isConfigured
}: Props) => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <FTHeader 
        onCreateClick={onCreateClick} 
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        isConfigured={isConfigured}
      />
      <FTList 
        fts={fts} 
        onTransfer={onTransfer}
        isTransferring={isTransferring}
      />
    </div>
  );
};
