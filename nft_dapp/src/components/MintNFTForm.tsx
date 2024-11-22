import React from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';

interface MintNFTFormProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export default function MintNFTForm({ isOpen, onClose, isConfigured }: MintNFTFormProps) {
  const [artifact, setArtifact] = React.useState<File | null>(null);
  const [metadata, setMetadata] = React.useState<File | null>(null);

  if (!isOpen) return null;

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) return;
    console.log('Minting with:', { artifact, metadata });
    onClose();
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle size={48} className="text-yellow-500" />
            <p className="text-center text-gray-600">
              Please connect both node and wallet to mint NFTs
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Mint NFT</h2>

        <form onSubmit={handleMint} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Artifact
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Upload your NFT artwork (supported formats: PNG, JPG, GIF, SVG)
            </p>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setArtifact(e.target.files?.[0] || null)}
                className="hidden"
                id="artifact-upload"
                accept="image/*"
                required
              />
              <label
                htmlFor="artifact-upload"
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
              >
                <Upload size={20} className="text-gray-500" />
                <span className="text-gray-600">
                  {artifact ? artifact.name : 'Choose file or drag and drop'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Upload JSON file containing NFT metadata (properties, attributes, etc.)
            </p>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setMetadata(e.target.files?.[0] || null)}
                className="hidden"
                id="metadata-upload"
                accept=".json"
                required
              />
              <label
                htmlFor="metadata-upload"
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
              >
                <FileText size={20} className="text-gray-500" />
                <span className="text-gray-600">
                  {metadata ? metadata.name : 'Choose JSON file'}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Mint NFT
          </button>
        </form>
      </div>
    </div>
  );
}