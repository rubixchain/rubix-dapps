import type { AppConfig, ConfigUpdateResponse } from '../types/config';

const CONFIG_API_URL = 'http://localhost:3000/api';
const TIMEOUT_MS = 5000; // 5 second timeout

// Utility function to handle timeouts
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const configService = {
  async getConfig(): Promise<AppConfig> {
    try {
      const response = await fetchWithTimeout(`${CONFIG_API_URL}/config`);
      
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading config:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load configuration');
    }
  },

  async updateConfig(updates: Partial<AppConfig>): Promise<ConfigUpdateResponse> {
    try {
      const response = await fetchWithTimeout(`${CONFIG_API_URL}/writeConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update configuration');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update configuration');
      }

      return result;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error instanceof Error ? error : new Error('Failed to update configuration');
    }
  }
};
