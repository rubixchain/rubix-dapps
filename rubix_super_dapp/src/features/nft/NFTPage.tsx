import React, { Suspense, lazy, useEffect } from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { api } from './services/api.ts';
import type { NFT } from './types/nft.ts';
import type { AppConfig } from '../../shared/types/config.ts';

// Lazy load components that aren't immediately needed
const NFTCard = lazy(() => import('./components/NFTCard.tsx'));
const TransferModal = lazy(() => import('./components/TransferModal.tsx'));
const MintNFTForm = lazy(() => import('./components/MintNFTForm.tsx'));

interface NFTPageProps {
  config: AppConfig;
}

function NFTPage({ config }: NFTPageProps) {
  const [isTransferModalOpen, setTransferModalOpen] = React.useState(false);
  const [isMintModalOpen, setMintModalOpen] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null);
  const [nfts, setNfts] = React.useState<NFT[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [transferSuccess, setTransferSuccess] = React.useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'NFT | Rubix Super DApp';
  }, []);

  // Fetch NFTs when config changes
  useEffect(() => {
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  }, [config.non_quorum_node_address, config.user_did]);

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
      setNfts(Array.isArray(nftList) ? nftList : []);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching NFTs');
      setNfts([]);
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

    if (!config.non_quorum_node_address || !config.user_did || !config.contracts_info?.nft?.contract_hash) {
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
        }
      );

      setTransferSuccess(true);
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
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  };

  const handleMintModalClose = () => {
    setMintModalOpen(false);
    if (config.non_quorum_node_address && config.user_did) {
      fetchNFTs();
    }
  };

  const isConfigured = Boolean(
    config.user_did && 
    config.non_quorum_node_address && 
    config.contracts_info?.nft?.contract_hash
  );

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-50 p-4">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900">Non-Fungible Token (NFT)</h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">NFT Collections</h2>
            <button
              onClick={handleRefresh}
              disabled={!isConfigured || isLoading}
              className="p-2 text-gray-600 hover:text-green-700 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
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
            config={config}
          />
        )}
      </Suspense>
    </div>
  );
}

export default NFTPage;
