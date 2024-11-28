import React, { Suspense, lazy, useEffect } from 'react';
import ConnectionForm from './components/ConnectionForm';
import { api } from './services/api';
import { configService } from './services/config';
import type { NFT } from './types/nft';
import type { AppConfig } from './types/config';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';

// Lazy load components that aren't immediately needed
const NFTCard = lazy(() => import('./components/NFTCard'));
const TransferModal = lazy(() => import('./components/TransferModal'));
const MintNFTForm = lazy(() => import('./components/MintNFTForm'));

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Something went wrong. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isTransferModalOpen, setTransferModalOpen] = React.useState(false);
  const [isMintModalOpen, setMintModalOpen] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);
  const [nfts, setNfts] = React.useState<NFT[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<Partial<AppConfig>>({});
  const [configError, setConfigError] = React.useState<string | null>(null);
  const [recommendedValues, setRecommendedValues] = React.useState<AppConfig | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [transferSuccess, setTransferSuccess] = React.useState(false);

  // Load recommended values from app.node.json
  useEffect(() => {
    const loadRecommendedValues = async () => {
      try {
        const values = await configService.getConfig();
        setRecommendedValues(values);
        // Also set nft_contract_hash in config
        setConfig(prev => ({ ...prev, nft_contract_hash: values.nft_contract_hash }));
      } catch (err) {
        console.error('Failed to load recommended values:', err);
      }
    };
    loadRecommendedValues();
  }, []);

  // Only fetch NFTs when both node and wallet are connected
  useEffect(() => {
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  }, [config.non_quorum_node_address, config.user_did]);

  const handleNodeConnect = async (url: string) => {
    try {
      setConfigError(null);
      setConfig(prev => ({ ...prev, non_quorum_node_address: url }));
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update node configuration');
    }
  };

  const handleNodeDisconnect = () => {
    try {
      setConfigError(null);
      setConfig(prev => ({ ...prev, non_quorum_node_address: '' }));
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update node configuration');
    }
  };

  const handleWalletConnect = async (did: string) => {
    try {
      setConfigError(null);
      setConfig(prev => ({ ...prev, user_did: did }));
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update wallet configuration');
    }
  };

  const handleWalletDisconnect = () => {
    try {
      setConfigError(null);
      setConfig(prev => ({ ...prev, user_did: '' }));
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update wallet configuration');
    }
  };

  const fetchNFTs = async () => {
    if (!config.non_quorum_node_address || !config.user_did) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const nftList = await api.listNFTsByDID({
        non_quorum_node_address: config.non_quorum_node_address,
        user_did: config.user_did
      });
      setNfts(Array.isArray(nftList) ? nftList : []); // Ensure nftList is an array
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching NFTs');
      setNfts([]); // Reset NFTs on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNFTs();
  };

  const handleTransfer = async (recipient: string, value: number) => {
    if (!selectedNFT) {
      setError('No NFT selected for transfer');
      return;
    }

    if (!config.non_quorum_node_address || !config.user_did || !config.nft_contract_hash) {
      console.log('Current config:', config);
      setError('Missing configuration. Please ensure node and wallet are connected.');
      return;
    }

    try {
      setIsTransferring(true);
      setError(null);
      setTransferSuccess(false);

      await api.transferNFT(
        {
          nftId: selectedNFT.nft,
          owner: selectedNFT.owner_did,
          recipient,
          value
        },
        {
          non_quorum_node_address: config.non_quorum_node_address,
          user_did: config.user_did,
          nft_contract_hash: config.nft_contract_hash
        }
      );

      setTransferSuccess(true);
      // Refresh NFT list after successful transfer
      await fetchNFTs();
    } catch (err) {
      console.error('Error transferring NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to transfer NFT');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleTransferModalClose = () => {
    setTransferModalOpen(false);
    setSelectedNFT(null);
    setError(null);
    setTransferSuccess(false);
    // Refresh NFT list when modal closes
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  };

  const handleMintModalClose = () => {
    setMintModalOpen(false);
    // Refresh NFT list after modal closes
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  };

  const isConfigured = Boolean(config.user_did && config.non_quorum_node_address && config.nft_contract_hash);

  const renderNFTContent = () => {
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NFTs...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (!Array.isArray(nfts) || nfts.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-600">No NFTs found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <Suspense 
            key={nft.nft} 
            fallback={
              <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
            }
          >
            <NFTCard
              {...nft}
              onTransfer={() => {
                setSelectedNFT(nft);
                setTransferModalOpen(true);
              }}
            />
          </Suspense>
        ))}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {configError && (
          <div className="bg-red-50 p-4">
            <p className="text-red-600 text-center">{configError}</p>
          </div>
        )}
        
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col items-center space-y-6">
              <img 
                src="https://learn.rubix.net/images/logo_name.png"
                alt="Rubix Logo"
                className="h-12 object-contain mb-4"
                loading="lazy"
              />
              {recommendedValues && (
                <p className="text-sm text-gray-600 text-center mb-4">
                  Enter the recommended values for Blockchain address: <span className="font-mono bg-gray-100 px-1 rounded">{recommendedValues.non_quorum_node_address}</span> and Wallet DID: <span className="font-mono bg-gray-100 px-1 rounded">{recommendedValues.user_did}</span> (created by scripts)
                </p>
              )}
              <p className="text-sm text-gray-600 text-center mb-4">
                  To create a new DID for testing NFT Transfer, run the command <span className="font-mono bg-gray-100 px-1 rounded">python create_did.py</span> present inside  <span className="font-mono bg-gray-100 px-1 rounded">scripts</span> directory
              </p>
              <div className="flex gap-6 items-center w-full">
                <ConnectionForm 
                  type="node" 
                  onConnect={handleNodeConnect}
                  onDisconnect={handleNodeDisconnect}
                  value={config.non_quorum_node_address || ''}
                  isConnected={Boolean(config.non_quorum_node_address)}
                />
                <ConnectionForm 
                  type="wallet" 
                  onConnect={handleWalletConnect}
                  onDisconnect={handleWalletDisconnect}
                  value={config.user_did || ''}
                  isConnected={Boolean(config.user_did)}
                />
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-gray-900">NFT Collections</h2>
              <button
                onClick={handleRefresh}
                disabled={!isConfigured || isLoading}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                title="Refresh NFT list"
              >
                <RefreshCw 
                  size={20} 
                  className={`${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
            <button
              onClick={() => setMintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
              disabled={!isConfigured}
            >
              <Plus size={20} />
              Mint a NFT
            </button>
          </div>
          {renderNFTContent()}
        </main>

        <Suspense fallback={null}>
          {isTransferModalOpen && (
            <TransferModal
              isOpen={isTransferModalOpen}
              onClose={handleTransferModalClose}
              onTransfer={handleTransfer}
              isConfigured={isConfigured}
              isLoading={isTransferring}
              error={error}
              success={transferSuccess}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {isMintModalOpen && (
            <MintNFTForm
              isOpen={isMintModalOpen}
              onClose={handleMintModalClose}
              isConfigured={isConfigured}
              config={config as Required<AppConfig>}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
