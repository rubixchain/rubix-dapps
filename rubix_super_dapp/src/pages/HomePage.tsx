import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to Rubix Super DApp
          </h1>
          
          {/* Core Apps Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Core Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link 
                to="/nft"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-4">NFT</h3>
                <p className="text-gray-600">
                  Mint and transfer NFTs on the Rubix network
                </p>
              </Link>
              <Link 
                to="/ft"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-4">FT</h3>
                <p className="text-gray-600">
                  Create and transfer fungible tokens on Rubix
                </p>
              </Link>
            </div>
          </div>

          {/* Sample Usecases Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sample Usecases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Sample usecases will be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
