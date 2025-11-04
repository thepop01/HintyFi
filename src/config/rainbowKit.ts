import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import {
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  rabbyWallet,
  phantomWallet,
  braveWallet,
  ledgerWallet,
  trustWallet,
  zerionWallet,
  argentWallet,
  imTokenWallet,
  omniWallet,
  oktoWallet,
  safeWallet,
  talismanWallet,
  xdefiWallet,
  bitskiWallet,
  frameWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        rabbyWallet,
        phantomWallet,
        walletConnectWallet,
        braveWallet,
        ledgerWallet,
        trustWallet,
        zerionWallet,
        argentWallet,
        imTokenWallet,
        omniWallet,
        oktoWallet,
        safeWallet,
        talismanWallet,
        xdefiWallet,
        bitskiWallet,
        frameWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'HintyFi',
    projectId: 'YOUR_PROJECT_ID',
  }
);

// Configure Wagmi config with connectors
export const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  connectors,
  ssr: true, // Enable if your app uses server-side rendering
});