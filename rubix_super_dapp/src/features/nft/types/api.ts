export interface SmartContractRequest {
  comment: string;
  executorAddr: string;
  quorumType: number;
  smartContractData: string;
  smartContractToken: string;
}

export interface SmartContractResponse {
  status: boolean;
  message?: string;
  result: {
    id: string;
  };
}

export interface SignatureRequest {
  id: string;
  mode: number;
  password: string;
}

export interface SignatureResponse {
  status: boolean;
  message?: string;
}

export interface StatusResponse {
  status: number;
}

export interface NFTMintInfo {
  metadataPath: string;
  artifactPath: string;
}

export interface NFTTransferInfo {
  nftId: string;
  owner: string;
  recipient: string;
  value: number;
}

export interface NFTTransferData {
  transfer_sample_nft: {
    name: string;
    nft_info: {
      comment: string;
      nft: string;
      nft_data: string;
      nft_value: number;
      owner: string;
      receiver: string;
    };
  };
}
