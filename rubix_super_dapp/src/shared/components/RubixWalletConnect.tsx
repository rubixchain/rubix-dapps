import React from 'react';
import { RUBIX_WALLET_URL } from '../../constants';
import { getDIDFromJwtPayload } from '../../features/utils/utils';
import { configService } from '../services/config';

interface RubixWalletConnectProps {
  onConnect?: (did: string) => void;
  className?: string;
}

export function RubixWalletConnect({ onConnect, className = '' }: RubixWalletConnectProps) {
  const handleConnect = async () => {
    window.addEventListener('message', async (event) => {
      console.log(`Received message from ${event.origin}:`, event.data);

      if (event.origin.includes(RUBIX_WALLET_URL)) {
        const tokenData = event.data;
        const userDid = getDIDFromJwtPayload(tokenData);

        await configService.updateConfig({ user_did: userDid! });
        onConnect?.(userDid!);

        window.removeEventListener('message', () => {});
      }
    });

    window.open(RUBIX_WALLET_URL, '_blank');
  };

  return (
    <button 
      className={`px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors ${className}`}
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
  );
}
