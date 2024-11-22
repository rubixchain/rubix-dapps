export interface NFT {
    id: string;
    owner: string;
  }
  
  export interface NFTResponse {
    success: boolean;
    data: NFT[];
    error?: string;
  }