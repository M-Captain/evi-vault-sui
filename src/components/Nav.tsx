import { useState } from 'react';
import ConnectWallet from './test';
import { WalletKitProvider } from '@mysten/wallet-kit';
import { Link } from 'react-router-dom';

function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <nav className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">EviVault</span>
                    </Link>
                    
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-center space-x-6">
                            <Link to="/get" className="text-gray-300 hover:text-white transition-colors duration-200">Public Evidence</Link>
                            <Link to="/add" className="text-gray-300 hover:text-white transition-colors duration-200">ADD Evidence</Link>
                            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200">Dashboard</Link>
                        </div>
                        
                        <WalletKitProvider>
                            <ConnectWallet />
                        </WalletKitProvider>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pt-4`}>
                    <div className="flex flex-col space-y-4">
                        <Link 
                            to="/get" 
                            className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Public Evidence
                        </Link>
                        <Link 
                            to="/add" 
                            className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ADD Evidence
                        </Link>
                        <Link 
                            to="/dashboard" 
                            className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <div className="pt-2">
                            <WalletKitProvider>
                                <ConnectWallet />
                            </WalletKitProvider>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Nav;