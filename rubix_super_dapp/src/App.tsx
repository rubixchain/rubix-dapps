import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './shared/components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import NFTPage from './features/nft/NFTPage.tsx';
import FTPage from './features/ft/FTPage.tsx';
import type { AppConfig } from './shared/types/config';
import { configService } from './shared/services/config';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Something went wrong. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [config, setConfig] = useState<AppConfig>({
    non_quorum_node_address: '',
    user_did: '',
    contracts_info: {
      nft: {
        contract_hash: '',
        contract_path: '',
        callback_url: ''
      },
      ft: {
        contract_hash: '',
        contract_path: '',
        callback_url: ''
      }
    }
  });

  // Load initial config from app.node.json
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const values = await configService.getConfig();
        setConfig(values);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    loadConfig();
  }, []);

  const handleWalletConnect = async (did: string) => {
    try {
      await configService.updateConfig({ user_did: did });
      setConfig(prev => ({ ...prev, user_did: did }));
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar onWalletConnect={handleWalletConnect} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nft" element={<NFTPage config={config} />} />
            <Route path="/ft" element={<FTPage config={config} />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
