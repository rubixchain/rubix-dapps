import type { AppConfig, ConfigUpdateResponse } from '../types/config';

export const configService = {
  async getConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/app.node.json');
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
      // For now, just return success since we're not actually updating the file
      return { success: true };
    } catch (error) {
      console.error('Error updating config:', error);
      throw error instanceof Error ? error : new Error('Failed to update configuration');
    }
  }
};
