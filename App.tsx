import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WalletProvider } from './context/WalletContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Router from './src/Router';
import { config } from './src/config/rainbowKit';

// Create a client for React Query
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ToastProvider>
            <AuthProvider>
              <WalletProvider>
                <Router />
              </WalletProvider>
            </AuthProvider>
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ErrorBoundary>
);

export default App;