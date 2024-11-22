import axios from 'axios';
import type { NFTResponse } from '../types/nft';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
  }
};