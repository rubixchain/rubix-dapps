export interface SmartContractRequest {
  comment: string;
  executorAddr: string;
  quorumType: number;
  smartContractData: string;
  smartContractToken: string;
}

export interface SmartContractResponse {
  status: boolean;
  message: string;
  result: {
    id: string;
    mode: number;
    hash: null;
    only_priv_key: boolean;
  };
}

export interface SignatureRequest {
  id: string;
  mode: number;
  password: string;
}

export interface SignatureResponse {
  status: boolean;
  message: string;
  result: null;
}

export interface StatusResponse {
  message: string;
  status: 0 | 1 | 2; // 0: pending, 1: success, 2: failed
}

export interface NFTMintInfo {
  artifactPath: string;
  metadataPath: string;
}
