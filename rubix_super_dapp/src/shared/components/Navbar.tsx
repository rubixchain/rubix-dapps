import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-transparent text-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://learn.rubix.net/images/logo_name.png"
                alt="Rubix Logo"
                className="h-8 object-contain"
                loading="lazy"
              />
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/nft" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              NFT
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
