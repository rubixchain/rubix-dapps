export interface AppConfig {
    user_did: string;
    non_quorum_node_address: string;
    nft_contract_hash: string;
    nft_contract_path: string;
  }
  
  export interface ConfigUpdateResponse {
    success: boolean;
    error?: string;
  }