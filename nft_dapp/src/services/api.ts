import axios from 'axios';
import { configService } from './config';
import type { NFTResponse, NFTListResponse, NFT } from '../types/nft';
import type { AppConfig } from '../types/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

let cachedConfig: AppConfig | null = null;

const getConfig = async (): Promise<AppConfig> => {
  if (!cachedConfig) {
    cachedConfig = await configService.getConfig();
  }
  return cachedConfig;
};

export const api = {
  async getNFTs(walletAddress: string) {
    try {
      const response = await axios.get<NFTResponse>(`${API_BASE_URL}/nfts`, {
        params: { wallet: walletAddress }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch NFTs');
      }
      throw error;
    }
  },

  async listNFTsByDID(): Promise<NFT[]> {
    try {
      const config = await getConfig();
      const response = await axios.get<NFTListResponse>(
        `${config.non_quorum_node_address}/api/list-nfts`
      );
      
      // Filter NFTs where owner matches user_did from config
      return response.data.nfts.filter(nft => nft.owner_did === config.user_did);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch NFTs');
      }
      throw error;
    }
  }
};
