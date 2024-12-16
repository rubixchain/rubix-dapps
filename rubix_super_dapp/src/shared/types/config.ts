interface ContractInfo {
  contract_hash: string;
  contract_path: string;
  callback_url: string;
}

interface ContractsInfo {
  ft: ContractInfo;
  nft: ContractInfo;
}

export interface AppConfig {
  user_did: string;
  non_quorum_node_address: string;
  contracts_info: ContractsInfo;
}
  
export interface ConfigUpdateResponse {
  success: boolean;
  error?: string;
}
