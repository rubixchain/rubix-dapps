import React, { useState, useEffect, useRef } from 'react';
import { FTDashboard } from './components/FTDashboard';
import { CreateFTForm } from './components/CreateFTForm';
import { Modal } from '../../shared/components/Modal';
import type { AppConfig } from '../../shared/types/config';
import type { FTFormData } from './types/ft';
import { api as ftService } from './services/api';
import type { FTInfo } from './services/api';
import { AlertCircle } from 'lucide-react';

interface FTPageProps {
  config: AppConfig;
}

function FTPage({ config }: FTPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [fts, setFts] = useState<FTInfo[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for abort controllers
  const createAbortController = useRef<AbortController | null>(null);
  const transferAbortController = useRef<AbortController | null>(null);

  const fetchFTs = async () => {
    if (!config.non_quorum_node_address || !config.user_did) {
      setFts([]); // Reset to empty array when not connected
      return;
    }

    setIsLoading(true);
    try {
      const ftList = await ftService.getFTsByDID();
      setFts(Array.isArray(ftList) ? ftList : []); // Ensure we always set an array
    } catch (err) {
      console.error('Failed to fetch FTs:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to fetch FTs');
      setFts([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFTs();
  };

  // Fetch FTs when config changes
  useEffect(() => {
    fetchFTs();
  }, [config.non_quorum_node_address, config.user_did]);

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
    setModalError(null);
    setModalSuccess(null);
  };

  const handleCreateModalClose = () => {
    if (isCreating) {
      // Cancel the ongoing operation
      if (createAbortController.current) {
        createAbortController.current.abort();
        createAbortController.current = null;
      }
      setIsCreating(false);
      setModalError('Operation cancelled');
    } else {
      setIsCreateModalOpen(false);
      setModalError(null);
      setModalSuccess(null);
    }
  };

  const handleCreateSubmit = async (data: FTFormData) => {
    try {
      setIsCreating(true);
      setModalError(null);
      setModalSuccess(null);

      // Create new abort controller
      createAbortController.current = new AbortController();
      
      await ftService.createFT(data, createAbortController.current.signal);
      createAbortController.current = null;
      
      // Show success message in modal
      setModalSuccess(`Successfully created FT: ${data.tokenName}`);
      
      // Add a small delay before refreshing the list to ensure backend is updated
      setTimeout(async () => {
        await fetchFTs();
        
        // Close modal after another short delay
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setModalError(null);
          setModalSuccess(null);
        }, 2000); // Close modal 2 seconds after success message
      }, 2000); // 2 second delay for list refresh
    } catch (err) {
      console.error('Failed to create FT:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setModalError('Operation cancelled');
      } else {
        setModalError(err instanceof Error ? err.message : 'Failed to create FT');
      }
    } finally {
      setIsCreating(false);
      createAbortController.current = null;
    }
  };

  const handleTransfer = async (data: {
    tokenName: string;
    amount: string;
    creatorDid: string;
    receiverDid: string;
  }) => {
    try {
      setIsTransferring(true);

      // Create new abort controller
      transferAbortController.current = new AbortController();
      
      await ftService.transferFT(data, transferAbortController.current.signal);
      transferAbortController.current = null;
      
      // Add a small delay before refreshing the list to ensure backend is updated
      setTimeout(async () => {
        await fetchFTs();
      }, 2000); // 2 second delay for list refresh

      return Promise.resolve();
    } catch (err) {
      console.error('Failed to transfer FT:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Operation cancelled');
      }
      throw err;
    } finally {
      setIsTransferring(false);
      transferAbortController.current = null;
    }
  };

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (createAbortController.current) {
        createAbortController.current.abort();
      }
      if (transferAbortController.current) {
        transferAbortController.current.abort();
      }
    };
  }, []);

  const isConfigured = Boolean(
    config.user_did && 
    config.non_quorum_node_address
  );

  const renderContent = () => {
    if (!config.non_quorum_node_address) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-lg text-gray-600">Please connect to a node first</p>
        </div>
      );
    }

    if (!config.user_did) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-lg text-gray-600">Please connect your wallet</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-600">Loading FTs...</p>
        </div>
      );
    }

    return (
      <FTDashboard 
        onCreateClick={handleCreateClick} 
        onRefresh={handleRefresh}
        onTransfer={handleTransfer}
        fts={fts}
        isTransferring={isTransferring}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        isConfigured={isConfigured}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {modalError && (
        <div className="bg-red-50 p-4">
          <p className="text-red-600 text-center">{modalError}</p>
        </div>
      )}

      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900">Fungible Token (FT)</h1>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto px-4">
          {renderContent()}
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
          title="Create New FT"
        >
          <CreateFTForm 
            onSubmit={handleCreateSubmit} 
            isLoading={isCreating}
            error={modalError}
            success={modalSuccess}
          />
        </Modal>
      </div>
    </div>
  );
}

export default FTPage;
