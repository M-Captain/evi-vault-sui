// App.jsx or index.jsx or wherever your top-level layout is defined
import { WalletKitProvider } from '@mysten/wallet-kit';
import { SuiClientProvider } from '@mysten/dapp-kit';
import GetEvidence from './components/get';
import AddEvidence from './components/add';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Home from './components/home';
import Nav from './components/Nav';
import Dashboard from './components/dashboard';
const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') }
};


function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/get"
            element={
              <QueryClientProvider client={queryClient}>
                <SuiClientProvider networks={networks} defaultNetwork="testnet">
                  <WalletKitProvider>
                    <div className="container mx-auto px-4 py-8">
                      <GetEvidence />
                    </div>
                  </WalletKitProvider>
                </SuiClientProvider>
              </QueryClientProvider>
            }
          />
          <Route
            path="/add"
            element={
              <QueryClientProvider client={queryClient}>
                <SuiClientProvider networks={networks} defaultNetwork="testnet">
                  <WalletKitProvider>
                    <div className="container mx-auto px-4 py-8">
                      <AddEvidence />
                    </div>
                  </WalletKitProvider>
                </SuiClientProvider>
              </QueryClientProvider>
            }
          />
          <Route path='/dashboard' element={<Dashboard />}/>
            
        </Routes>
      </Router>
    </div>
  );
}

export default App;
