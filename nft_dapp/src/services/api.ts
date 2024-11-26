import axios from 'axios';
import { configService } from './config';
import type { NFTResponse, NFTListResponse, NFT } from '../types/nft';
import type { AppConfig } from '../types/config';
import type {
  SmartContractRequest,
  SmartContractResponse,
  SignatureRequest,
  SignatureResponse,
  StatusResponse,
  NFTMintInfo
} from '../types/api';

const CONFIG_API_URL = 'http://localhost:3000/api';
const STATUS_CHECK_URL = 'http://localhost:8080/request-status';
const STATUS_CHECK_INTERVAL = 20000; // 20 seconds

let cachedConfig: AppConfig | null = null;

const getConfig = async (): Promise<AppConfig> => {
  if (!cachedConfig) {
    cachedConfig = await configService.getConfig();
  }
  return cachedConfig;
};

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

  // Keep the original working implementation for listNFTsByDID
  async listNFTsByDID(): Promise<NFT[]> {
    try {
      const config = await getConfig();
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

  async pollMintingStatus(contractHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          console.log('Checking minting status...');
          const response = await axios.get<StatusResponse>(STATUS_CHECK_URL, {
            params: { req_id: `${contractHash}-mint` }
          });

          console.log('Status response:', response.data);

          switch (response.data.status) {
            case 0: // Pending
              console.log('Minting pending, checking again in 20 seconds...');
              setTimeout(checkStatus, STATUS_CHECK_INTERVAL);
              break;
            case 1: // Success
              console.log('Minting completed successfully');
              resolve();
              break;
            case 2: // Failed
              console.error('Minting failed');
              reject(new Error('NFT minting failed'));
              break;
            default:
              console.error('Unknown status:', response.data.status);
              reject(new Error('Unknown minting status received'));
          }
        } catch (error) {
          console.error('Error checking status:', error);
          reject(error);
        }
      };

      // Start polling
      checkStatus();
    });
  },

  async mintNFT(nftInfo: NFTMintInfo): Promise<void> {
    const config = await getConfig();
    if (!config.non_quorum_node_address || !config.user_did || !config.nft_contract_hash) {
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
        smartContractToken: config.nft_contract_hash
      };

      console.log('Execute Request:', executeRequest);

      const executeResponse = await axios.post<SmartContractResponse>(
        `/api/execute-smart-contract`,
        executeRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          }
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
          }
        }
      );

      console.log('Signature response:', signatureResponse.data);

      if (!signatureResponse.data.status) {
        throw new Error(signatureResponse.data.message || 'Signature submission failed');
      }

      // Step 3: Poll for minting status
      console.log('Starting to poll minting status...');
      await this.pollMintingStatus(config.nft_contract_hash);
      console.log('NFT minting process completed');
    } catch (error) {
      console.error('Error in mintNFT:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to mint NFT: ${errorMessage}`);
      }
      throw error;
    }
  }
};
