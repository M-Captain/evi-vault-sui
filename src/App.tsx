import './App.css'
// App.jsx or index.jsx or wherever your top-level layout is defined
import { WalletKitProvider } from '@mysten/wallet-kit';
import { SuiClientProvider, createNetworkConfig } from '@mysten/dapp-kit';
import ConnectWallet from './components/test';
import GetEvidence from './components/get';
import AddEvidence from './components/add';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') }
};

function Home() {
  return <h2>Home Page</h2>;
}

function About() {
  return <h2>About Page</h2>;
}


function App() {
  return (
    <div>
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route
          path="/"
          element={
            <>
              <h1>Evidence Management System</h1>
              <QueryClientProvider client={queryClient}>
                <SuiClientProvider networks={networks} defaultNetwork="testnet">
                  <WalletKitProvider>
                    <ConnectWallet />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      <AddEvidence />
                      <GetEvidence />
                    </div>
                  </WalletKitProvider>
                </SuiClientProvider>
              </QueryClientProvider>
            </>
          }
        />
      </Routes>
    </Router>
    </div> 

  );
}

export default App;
