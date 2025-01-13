import { Link } from 'react-router-dom';
import { RubixWalletConnect } from './RubixWalletConnect';

interface NavbarProps {
  onWalletConnect: (did: string) => void;
}

const Navbar = ({ onWalletConnect }: NavbarProps) => {
  return (
    <nav className="bg-transparent text-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="https://media.licdn.com/dms/image/v2/D5622AQFIbwoNpFTP3A/feedshare-shrink_800/feedshare-shrink_800/0/1732726454751?e=2147483647&v=beta&t=p4U6KZaktVgk1LR5FludFp9hxCi1aG0FW4yaNfUgs0k"
              alt="Rubix Logo"
              className="h-28 object-contain"
              loading="lazy"
            />
          </Link>
          <div className="flex items-center">
            <RubixWalletConnect onConnect={onWalletConnect} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
