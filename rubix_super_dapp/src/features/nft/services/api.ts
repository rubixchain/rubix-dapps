import axios from 'axios';
import type { NFTResponse, NFTListResponse, NFT } from '../types/nft.ts';
import type { AppConfig } from '../../../shared/types/config.ts';
import type {
  SmartContractRequest,
  SmartContractResponse,
  SignatureRequest,
  SignatureResponse,
  StatusResponse,
  NFTMintInfo,
  NFTTransferInfo,
  NFTTransferData
} from '../types/api.ts';

const CONFIG_API_URL = 'http://localhost:3000/api';
const STATUS_CHECK_URL = 'http://localhost:8080/request-status';
const STATUS_CHECK_INTERVAL = 6000; // Changed to 6 seconds to match FT

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const api = {
  async getNFTs(walletAddress: string) {
    try {
      const response = await apiClient.get<NFTResponse>(`${CONFIG_API_URL}/nfts`, {
        params: { wallet: walletAddress }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  },

  async listNFTsByDID(config: Pick<AppConfig, 'non_quorum_node_address' | 'user_did'>): Promise<NFT[]> {
    try {
      const response = await axios.get<NFTListResponse>(
        `${config.non_quorum_node_address}/api/list-nfts`
      );
      
      if (!response.data || !response.data.nfts) {
        return [];
      }
      
      return response.data.nfts.filter(nft => nft.owner_did === config.user_did);
    } catch (error) {
      console.error('Error listing NFTs:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async pollStatus(contractHash: string, operation: 'mint' | 'transfer', signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          if (signal?.aborted) {
            reject(new Error('Operation cancelled'));
            return;
          }

          console.log(`Checking NFT ${operation} status...`);
          const response = await axios.get<StatusResponse>(STATUS_CHECK_URL, {
            params: { req_id: `nft-${contractHash}-${operation}` },
            signal
          });

          console.log('Status response:', response.data);

          switch (response.data.status) {
            case 0: // Pending
              console.log(`NFT ${operation} pending, checking again in 6 seconds...`);
              setTimeout(checkStatus, STATUS_CHECK_INTERVAL);
              break;
            case 1: // Success
              console.log(`NFT ${operation} completed successfully`);
              resolve();
              break;
            case 2: // Failed
              console.error(`NFT ${operation} failed`);
              reject(new Error(`NFT ${operation} failed`));
              break;
            default:
              console.error('Unknown status:', response.data.status);
              reject(new Error('Unknown status received'));
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            reject(new Error('Operation cancelled'));
          } else {
            console.error('Error checking status:', error);
            reject(error);
          }
        }
      };

      // Start polling
      checkStatus();
    });
  },

  async mintNFT(
    nftInfo: NFTMintInfo,
    config: Pick<AppConfig, 'non_quorum_node_address' | 'user_did' | 'contracts_info'>,
    signal?: AbortSignal
  ): Promise<void> {
    if (!config.non_quorum_node_address || !config.user_did || !config.contracts_info?.nft?.contract_hash) {
      throw new Error('Missing configuration for NFT minting');
    }

    try {
      // Step 1: Execute smart contract
      const mintData = {
        mint_sample_nft: {
          name: "rubix1",
          nft_info: {
            did: config.user_did,
            metadata: nftInfo.metadataPath,
            artifact: nftInfo.artifactPath
          }
        }
      };

      const executeRequest: SmartContractRequest = {
        comment: `Mint NFT Request - ${Date.now()}`,
        executorAddr: config.user_did,
        quorumType: 2,
        smartContractData: JSON.stringify(mintData),
        smartContractToken: config.contracts_info.nft.contract_hash
      };

      console.log('Execute Request:', executeRequest);

      const executeResponse = await axios.post<SmartContractResponse>(
        `/api/execute-smart-contract`,
        executeRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal
        }
      );

      console.log('Smart contract execution response:', executeResponse.data);

      if (!executeResponse.data.status) {
        throw new Error(executeResponse.data.message || 'Smart contract execution failed');
      }

      const requestId = executeResponse.data.result.id;

      // Step 2: Submit signature using the request ID
      console.log('Submitting signature for request:', requestId);

      const signatureRequest: SignatureRequest = {
        id: requestId,
        mode: 0,
        password: "mypassword"
      };

      const signatureResponse = await axios.post<SignatureResponse>(
        `/api/signature-response`,
        signatureRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal
        }
      );

      console.log('Signature response:', signatureResponse.data);

      if (!signatureResponse.data.status) {
        throw new Error(signatureResponse.data.message || 'Signature submission failed');
      }

      // Step 3: Poll for minting status
      console.log('Starting to poll minting status...');
      await this.pollStatus(config.contracts_info.nft.contract_hash, 'mint', signal);
      console.log('NFT minting process completed');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Operation cancelled');
      }
      console.error('Error in mintNFT:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to mint NFT: ${errorMessage}`);
      }
      throw error;
    }
  },

  async transferNFT(
    transferInfo: NFTTransferInfo,
    config: Pick<AppConfig, 'non_quorum_node_address' | 'user_did' | 'contracts_info'>,
    signal?: AbortSignal
  ): Promise<void> {
    if (!config.non_quorum_node_address || !config.user_did || !config.contracts_info?.nft?.contract_hash) {
      throw new Error('Missing configuration for NFT transfer');
    }

    try {
      // Step 1: Execute smart contract
      const transferData: NFTTransferData = {
        transfer_sample_nft: {
          name: "rubix1",
          nft_info: {
            comment: `NFT Transfer - ${Date.now()}`,
            nft: transferInfo.nftId,
            nft_data: "",
            nft_value: transferInfo.value,
            owner: transferInfo.owner,
            receiver: transferInfo.recipient
          }
        }
      };

      const executeRequest: SmartContractRequest = {
        comment: `Transfer NFT Request - ${Date.now()}`,
        executorAddr: config.user_did,
        quorumType: 2,
        smartContractData: JSON.stringify(transferData),
        smartContractToken: config.contracts_info.nft.contract_hash
      };

      console.log('Execute Transfer Request:', executeRequest);

      const executeResponse = await axios.post<SmartContractResponse>(
        `/api/execute-smart-contract`,
        executeRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal
        }
      );

      console.log('Smart contract execution response:', executeResponse.data);

      if (!executeResponse.data.status) {
        throw new Error(executeResponse.data.message || 'Smart contract execution failed');
      }

      const requestId = executeResponse.data.result.id;

      // Step 2: Submit signature using the request ID
      console.log('Submitting signature for request:', requestId);

      const signatureRequest: SignatureRequest = {
        id: requestId,
        mode: 0,
        password: "mypassword"
      };

      const signatureResponse = await axios.post<SignatureResponse>(
        `/api/signature-response`,
        signatureRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal
        }
      );

      console.log('Signature response:', signatureResponse.data);

      if (!signatureResponse.data.status) {
        throw new Error(signatureResponse.data.message || 'Signature submission failed');
      }

      // Step 3: Poll for transfer status
      console.log('Starting to poll transfer status...');
      await this.pollStatus(config.contracts_info.nft.contract_hash, 'transfer', signal);
      console.log('NFT transfer process completed');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Operation cancelled');
      }
      console.error('Error in transferNFT:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to transfer NFT: ${errorMessage}`);
      }
      throw error;
    }
  }
};
