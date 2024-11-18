import React from 'react';
import { Upload, FileText, X } from 'lucide-react';
import LoadingButton from './LoadingButton';

interface MintNFTFormProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (artifact: File, metadata: File) => void;
  isLoading: boolean;
}

export default function MintNFTForm({ isOpen, onClose, onMint, isLoading }: MintNFTFormProps) {
  const [artifact, setArtifact] = React.useState<File | null>(null);
  const [metadata, setMetadata] = React.useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artifact && metadata) {
      onMint(artifact, metadata);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Mint NFT</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
          >
            Mint NFT
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}