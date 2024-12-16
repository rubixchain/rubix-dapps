import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import type { FTInfo } from '../services/api';
import { Modal } from '../../../shared/components/Modal';
import { TransferFTForm } from './TransferFTForm';

interface Props {
  fts: FTInfo[];
  onTransfer: (data: {
    tokenName: string;
    amount: string;
    creatorDid: string;
    receiverDid: string;
  }) => Promise<void>;
  isTransferring?: boolean;
}

export const FTList = ({ 
  fts = [], // Provide default empty array
  onTransfer,
  isTransferring = false,
}: Props) => {
  const [selectedFT, setSelectedFT] = useState<FTInfo | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const handleTransferClick = (ft: FTInfo) => {
    setSelectedFT(ft);
    setIsTransferModalOpen(true);
    setTransferError(null);
    setTransferSuccess(null);
  };

  const handleTransferModalClose = () => {
    if (!isTransferring) {
      setIsTransferModalOpen(false);
      setSelectedFT(null);
      setTransferError(null);
      setTransferSuccess(null);
    }
  };

  const handleTransfer = async (data: {
    tokenName: string;
    amount: string;
    creatorDid: string;
    receiverDid: string;
  }) => {
    try {
      await onTransfer(data);
      setTransferSuccess(`Successfully transferred ${data.amount} ${data.tokenName}`);
      setTimeout(() => {
        handleTransferModalClose();
      }, 2000);
    } catch (err) {
      console.error('Transfer error:', err);
      setTransferError(err instanceof Error ? err.message : 'Failed to transfer FT');
    }
  };

  // Check if fts is an array and has length of 0
  if (!Array.isArray(fts) || fts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-gray-500">
          <Coins className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <p className="text-lg">No FTs Found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator DID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fts.map((ft, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">{ft.ft_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{ft.ft_count}</td>
                  <td className="px-6 py-4 text-gray-700 font-mono text-sm">{ft.creator_did}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleTransferClick(ft)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={handleTransferModalClose}
        title="Transfer FT"
      >
        <TransferFTForm
          onSubmit={handleTransfer}
          isLoading={isTransferring}
          error={transferError}
          success={transferSuccess}
          initialTokenName={selectedFT?.ft_name}
          initialCreatorDid={selectedFT?.creator_did}
        />
      </Modal>
    </>
  );
};
