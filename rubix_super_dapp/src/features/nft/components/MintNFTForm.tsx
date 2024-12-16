import React from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';
import type { AppConfig } from '../../../shared/types/config';

interface MintNFTFormProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  config: Required<AppConfig>;
}

export default function MintNFTForm({ isOpen, onClose, isConfigured, config }: MintNFTFormProps) {
  const [artifact, setArtifact] = React.useState<File | null>(null);
  const [metadata, setMetadata] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [status, setStatus] = React.useState<string>('');

  if (!isOpen) return null;

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !artifact || !metadata) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setStatus('Starting minting process...');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('artifact', artifact);
      formData.append('metadata', metadata);

      // Upload files first
      setStatus('Uploading files to server...');
      console.log('Uploading files...');
      
      const response = await fetch('http://localhost:3000/file_server/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const uploadResult = await response.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload files');
      }

      console.log('Files uploaded successfully:', uploadResult.paths);
      setStatus('Files uploaded. Initiating NFT minting...');

      // Now mint the NFT with the file paths
      try {
        await api.mintNFT(
          {
            artifactPath: uploadResult.paths.artifactPath,
            metadataPath: uploadResult.paths.metadataPath
          },
          {
            non_quorum_node_address: config.non_quorum_node_address,
            user_did: config.user_did,
            contracts_info: config.contracts_info
          }
        );
        
        console.log('NFT minted successfully');
        setSuccess(true);
        setStatus('NFT minted successfully!');
        
        setTimeout(() => {
          onClose();
        }, 2000); // Close after 2 seconds on success
      } catch (mintError) {
        console.error('Minting error:', mintError);
        throw mintError;
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process request');
      setStatus('Error occurred during the process');
    } finally {
      setIsLoading(false);
    }
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
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
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
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Mint NFT</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 whitespace-pre-line">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-600">NFT minted successfully!</p>
          </div>
        )}

        {isLoading && status && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-600">{status}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleMint} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NFT Artifact
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Upload your NFT artifact file
            </p>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setArtifact(e.target.files?.[0] || null)}
                className="hidden"
                id="artifact-upload"
                required
                disabled={isLoading}
              />
              <label
                htmlFor="artifact-upload"
                className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isLoading
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-green-500'
                }`}
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
                disabled={isLoading}
              />
              <label
                htmlFor="metadata-upload"
                className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isLoading
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-green-500'
                }`}
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
            disabled={isLoading || !artifact || !metadata}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              isLoading || !artifact || !metadata
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800'
            } text-white`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              'Mint NFT'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
