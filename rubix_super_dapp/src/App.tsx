import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './shared/components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import NFTPage from './features/nft/NFTPage.tsx';
import DeployingSoon from './pages/DeployingSoon.tsx';

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
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nft" element={<NFTPage />} />
            <Route path="/ft" element={<DeployingSoon />} />
            <Route path="/zk-app" element={<DeployingSoon />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
