<<<<<<< HEAD
import './App.css'
// App.jsx or index.jsx or wherever your top-level layout is defined
import { WalletKitProvider } from '@mysten/wallet-kit';
import { SuiClientProvider, createNetworkConfig } from '@mysten/dapp-kit';
import ConnectWallet from './components/test';
=======
// App.jsx or index.jsx or wherever your top-level layout is defined
import { WalletKitProvider } from '@mysten/wallet-kit';
import { SuiClientProvider } from '@mysten/dapp-kit';
>>>>>>> master
import GetEvidence from './components/get';
import AddEvidence from './components/add';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
<<<<<<< HEAD
  Route,
  Link
} from 'react-router-dom';

=======
  Route
} from 'react-router-dom';
import Home from './components/home';
import Nav from './components/Nav';
import Dashboard from './components/dashboard';
>>>>>>> master
const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') }
};

<<<<<<< HEAD
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
=======

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
>>>>>>> master
                      <GetEvidence />
                    </div>
                  </WalletKitProvider>
                </SuiClientProvider>
              </QueryClientProvider>
<<<<<<< HEAD
            </>
          }
        />
      </Routes>
    </Router>
    </div> 

=======
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
>>>>>>> master
  );
}

export default App;
