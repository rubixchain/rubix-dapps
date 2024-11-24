export interface NFT {
  nft: string;  // This is the NFT ID
  owner_did: string;
  nft_value: number;
}

export interface NFTResponse {
  success: boolean;
  data: NFT[];
  error?: string;
}

export interface NFTListResponse {
  status: boolean;
  message: string;
  result: null | string;
  nfts: NFT[];
}
