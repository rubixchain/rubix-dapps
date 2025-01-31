import React, { useEffect, useState } from 'react';
import { RUBIX_WALLET_URL } from '../../constants';
import { getDIDFromJwtPayload } from '../../features/utils/utils';
import { configService } from '../services/config';

interface RubixWalletConnectProps {
  onConnect?: (did: string) => void;
  className?: string;
}

export function RubixWalletConnect({ onConnect, className = '' }: RubixWalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [userDid, setUserDid] = useState<string>('');

  useEffect(() => {
    const checkConnectionState = async () => {
      const config = await configService.getConfig();
      if (config.user_did && config.user_token) {
        setIsConnected(true);
        setUserDid(config.user_did);
      }
    };

    checkConnectionState();
  }, []);

  const handleDisconnect = async () => {
    await configService.updateConfig({ 
      user_did: '', 
      user_token: '' 
    });
    setIsConnected(false);
    setUserDid('');
  };

  const handleConnect = async () => {
    if (isConnected) {
      await handleDisconnect();
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      if (event.origin.includes(RUBIX_WALLET_URL)) {
        const tokenData = event.data;
        const userDid = getDIDFromJwtPayload(tokenData);

        await configService.updateConfig({ 
          user_did: userDid!, 
          user_token: tokenData 
        });
        setIsConnected(true);
        setUserDid(userDid!);
        onConnect?.(userDid!);

        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);
    window.open(RUBIX_WALLET_URL, '_blank');
  };

  return (
    <button 
      className={`px-6 py-2 ${
        isConnected 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-green-700 hover:bg-green-800'
      } text-white rounded-lg transition-colors ${className}`}
      onClick={handleConnect}
    >
      {isConnected ? (
        <span className="flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          {userDid.slice(0, 12)}...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
