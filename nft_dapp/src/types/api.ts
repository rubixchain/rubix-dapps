// API Response Types
export interface APIResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
  }
  
  // NFT Related Types
  export interface NFT {
    id: string;
    name: string;
    image: string;
    owner: string;
    tokenId: string;
    metadata: Record<string, any>;
  }
  
  // Transaction Related Types
  export interface TransferNFTRequest {
    tokenId: string;
    recipient: string;
    value: number;
  }
  
  export interface MintNFTRequest {
    name: string;
    description: string;
    artifactUrl: string;
    metadata: Record<string, any>;
  }
  
  // Blockchain Related Types
  export interface BlockchainConnection {
    nodeUrl: string;
    chainId: number;
    connected: boolean;
  }
  
  export interface WalletConnection {
    address: string;
    balance: string;
    connected: boolean;
  }