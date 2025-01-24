import type { AppConfig, ConfigUpdateResponse } from '../types/config';

export const configService = {
  async getConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/file_server/config');
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
      const response = await fetch('/file_server/writeConfig', {
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
