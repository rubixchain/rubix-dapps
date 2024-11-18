import React from 'react';
import ConnectionForm from './components/ConnectionForm';
import NFTCard from './components/NFTCard';
import TransferModal from './components/TransferModal';
import MintNFTForm from './components/MintNFTForm';
import StatusModal from './components/StatusModal';
import LoadingButton from './components/LoadingButton';
import { Plus } from 'lucide-react';

// Mock data for demonstration
const mockNFTs = [
  {
    id: '1',
    name: 'Cosmic Voyager #1',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    id: '2',
    name: 'Digital Dreams #2',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    id: '3',
    name: 'Neon Genesis #3',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=600',
  },
];

function App() {
  const [isTransferModalOpen, setTransferModalOpen] = React.useState(false);
  const [isMintModalOpen, setMintModalOpen] = React.useState(false);
  const [selectedNFT, setSelectedNFT] = React.useState<string | null>(null);
  const [nodeConfig, setNodeConfig] = React.useState({
    url: '',
    isConnected: false
  });
  const [walletConfig, setWalletConfig] = React.useState({
    address: '',
    isConnected: false
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusModal, setStatusModal] = React.useState({
    isOpen: false,
    success: false,
    message: ''
  });

  const handleNodeConnect = (url: string) => {
    setNodeConfig({
      url,
      isConnected: true
    });
  };

  const handleWalletConnect = (address: string) => {
    setWalletConfig({
      address,
      isConnected: true
    });
  };

  const handleTransfer = async (recipient: string, value: number) => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatusModal({
        isOpen: true,
        success: true,
        message: `Successfully transferred NFT to ${recipient}`
      });
    } catch (error) {
      setStatusModal({
        isOpen: true,
        success: false,
        message: 'Failed to transfer NFT. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setTransferModalOpen(false);
    }
  };

  const handleMint = async (artifact: File, metadata: File) => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatusModal({
        isOpen: true,
        success: true,
        message: 'NFT minted successfully!'
      });
    } catch (error) {
      setStatusModal({
        isOpen: true,
        success: false,
        message: 'Failed to mint NFT. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setMintModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Connection Forms */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center space-y-6">
            <img 
              src="https://learn.rubix.net/images/logo_name.png"
              alt="Rubix Logo"
              className="h-12 object-contain mb-4"
            />
            <div className="flex gap-6 items-center w-full">
              <ConnectionForm 
                type="node" 
                onConnect={handleNodeConnect}
                value={nodeConfig.url}
                isConnected={nodeConfig.isConnected}
              />
              <ConnectionForm 
                type="wallet" 
                onConnect={handleWalletConnect}
                value={walletConfig.address}
                isConnected={walletConfig.isConnected}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* NFT Collections Header with Mint Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">NFT Collections</h2>
          <LoadingButton
            isLoading={false}
            onClick={() => setMintModalOpen(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Mint a NFT
          </LoadingButton>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              {...nft}
              onTransfer={() => {
                setSelectedNFT(nft.id);
                setTransferModalOpen(true);
              }}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransfer}
        isLoading={isLoading}
      />

      {isMintModalOpen && (
        <MintNFTForm
          isOpen={isMintModalOpen}
          onClose={() => setMintModalOpen(false)}
          onMint={handleMint}
          isLoading={isLoading}
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        success={statusModal.success}
        message={statusModal.message}
      />
    </div>
  );
}

export default App;