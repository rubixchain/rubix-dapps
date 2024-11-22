import React, { Suspense, lazy } from 'react';
import ConnectionForm from './components/ConnectionForm';
import { api } from './services/api';
import { configService } from './services/config';
import type { NFT } from './types/nft';
import type { AppConfig } from './types/config';
import { AlertCircle, Plus } from 'lucide-react';

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
  const [selectedNFT, setSelectedNFT] = React.useState<string | null>(null);
  const [nfts, setNfts] = React.useState<NFT[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [config, setConfig] = React.useState<Partial<AppConfig>>({});
  const [configError, setConfigError] = React.useState<string | null>(null);

  const handleNodeConnect = async (url: string) => {
    try {
      setConfigError(null);
      await configService.updateConfig({ non_quorum_node_address: url });
      setConfig(prev => ({ ...prev, non_quorum_node_address: url }));
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update node configuration');
    }
  };

  const handleWalletConnect = async (did: string) => {
    try {
      setConfigError(null);
      await configService.updateConfig({ user_did: did });
      setConfig(prev => ({ ...prev, user_did: did }));
      fetchNFTs(did);
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : 'Failed to update wallet configuration');
    }
  };

  const fetchNFTs = async (walletAddress: string) => {
    if (!config.non_quorum_node_address) {
      setError('Please connect to a node first');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getNFTs(walletAddress);
      if (response.success) {
        setNfts(response.data);
      } else {
        setError(response.error || 'Failed to fetch NFTs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = (recipient: string, value: number) => {
    if (!config.user_did || !config.non_quorum_node_address) {
      setError('Please connect both node and wallet before performing operations');
      return;
    }
    console.log('Transferring NFT:', { nftId: selectedNFT, recipient, value });
  };

  const isConfigured = Boolean(config.user_did && config.non_quorum_node_address);

  const renderNFTContent = () => {
    if (!config.user_did) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-lg text-gray-600">Connect your wallet to load NFTs</p>
        </div>
      );
    }

    if (!config.non_quorum_node_address) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-lg text-gray-600">Please connect to a node first</p>
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

    if (nfts.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-600">No NFTs Found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <Suspense 
            key={nft.id} 
            fallback={
              <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
            }
          >
            <NFTCard
              {...nft}
              onTransfer={() => {
                setSelectedNFT(nft.id);
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
              <div className="flex gap-6 items-center w-full">
                <ConnectionForm 
                  type="node" 
                  onConnect={handleNodeConnect}
                  value=""
                  isConnected={Boolean(config.non_quorum_node_address)}
                />
                <ConnectionForm 
                  type="wallet" 
                  onConnect={handleWalletConnect}
                  value=""
                  isConnected={Boolean(config.user_did)}
                />
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">NFT Collections</h2>
            <button
              onClick={() => setMintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
              onClose={() => setTransferModalOpen(false)}
              onTransfer={handleTransfer}
              isConfigured={isConfigured}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          {isMintModalOpen && (
            <MintNFTForm
              isOpen={isMintModalOpen}
              onClose={() => setMintModalOpen(false)}
              isConfigured={isConfigured}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
