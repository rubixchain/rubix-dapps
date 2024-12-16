import React, { useState, useEffect, useRef } from 'react';
import { FTDashboard } from './components/FTDashboard';
import { CreateFTForm } from './components/CreateFTForm';
import { Modal } from '../../shared/components/Modal';
import type { AppConfig } from '../../shared/types/config';
import type { FTFormData } from './types/ft';
import ConnectionForm from '../../shared/components/ConnectionForm';
import { configService } from '../../shared/services/config';
import { api as ftService } from './services/api';
import type { FTInfo } from './services/api';
import { AlertCircle } from 'lucide-react';

type Props = {
  config?: AppConfig;
};

function FTPage({ config }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [recommendedValues, setRecommendedValues] = useState<AppConfig | null>(null);
  const [fts, setFts] = useState<FTInfo[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Initialize connection state
  const [connectionConfig, setConnectionConfig] = useState<Partial<AppConfig>>({
    non_quorum_node_address: '',
    user_did: ''
  });

  // Refs for abort controllers
  const createAbortController = useRef<AbortController | null>(null);
  const transferAbortController = useRef<AbortController | null>(null);

  // Load recommended values from app.node.json
  useEffect(() => {
    const loadRecommendedValues = async () => {
      try {
        const values = await configService.getConfig();
        console.log('Loaded recommended values:', values);
        setRecommendedValues(values);
      } catch (err) {
        console.error('Failed to load recommended values:', err);
        setModalError(err instanceof Error ? err.message : 'Failed to load recommended values');
      }
    };
    loadRecommendedValues();
  }, []);

  const fetchFTs = async () => {
    if (!connectionConfig.non_quorum_node_address || !connectionConfig.user_did) {
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

  // Fetch FTs when both connection forms are filled
  useEffect(() => {
    fetchFTs();
  }, [connectionConfig.non_quorum_node_address, connectionConfig.user_did]);

  const handleNodeConnect = async (url: string) => {
    try {
      await configService.updateConfig({ non_quorum_node_address: url });
      setConnectionConfig(prev => ({ ...prev, non_quorum_node_address: url }));
      setModalError(null);
    } catch (err) {
      console.error('Failed to update node configuration:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to update node configuration');
    }
  };

  const handleNodeDisconnect = async () => {
    try {
      await configService.updateConfig({ non_quorum_node_address: '' });
      setConnectionConfig(prev => ({ ...prev, non_quorum_node_address: '' }));
      setModalError(null);
      setFts([]); // Reset to empty array on disconnect
    } catch (err) {
      console.error('Failed to update node configuration:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to update node configuration');
    }
  };

  const handleWalletConnect = async (did: string) => {
    try {
      await configService.updateConfig({ user_did: did });
      setConnectionConfig(prev => ({ ...prev, user_did: did }));
      setModalError(null);
    } catch (err) {
      console.error('Failed to update wallet configuration:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to update wallet configuration');
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await configService.updateConfig({ user_did: '' });
      setConnectionConfig(prev => ({ ...prev, user_did: '' }));
      setModalError(null);
      setFts([]); // Reset to empty array on disconnect
    } catch (err) {
      console.error('Failed to update wallet configuration:', err);
      setModalError(err instanceof Error ? err.message : 'Failed to update wallet configuration');
    }
  };

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
    connectionConfig.user_did && 
    connectionConfig.non_quorum_node_address
  );

  const renderContent = () => {
    if (!connectionConfig.non_quorum_node_address) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-lg text-gray-600">Please connect to a node first</p>
        </div>
      );
    }

    if (!connectionConfig.user_did) {
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

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center space-y-2">
            {recommendedValues && (
              <p className="text-sm text-gray-600 text-center">
                Enter the recommended values for Blockchain address: <span className="font-mono">{recommendedValues.non_quorum_node_address}</span> and Wallet DID: <span className="font-mono">{recommendedValues.user_did}</span> (created by scripts)
              </p>
            )}
            <p className="text-sm text-gray-600 text-center mb-4">
              To create a new DID for testing FT Transfer, run the command <span className="font-mono">python create_did.py</span> present inside <span className="font-mono">scripts</span> directory
            </p>
            <div className="flex gap-6 items-center w-full">
              <ConnectionForm 
                type="node" 
                onConnect={handleNodeConnect}
                onDisconnect={handleNodeDisconnect}
                value={connectionConfig.non_quorum_node_address || ''}
                isConnected={Boolean(connectionConfig.non_quorum_node_address)}
              />
              <ConnectionForm 
                type="wallet" 
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                value={connectionConfig.user_did || ''}
                isConnected={Boolean(connectionConfig.user_did)}
              />
            </div>
          </div>
        </div>
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
