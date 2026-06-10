import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, trustWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { sepolia, anvil } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: 'uniQ',
  projectId: 'f3a0feb8c0ccc909d1dcbfd56133a14e', // Valid WalletConnect Project ID for mobile
  chains: [sepolia, anvil],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet],
    },
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"),
    [anvil.id]: http("http://localhost:8545"),
  },
  ssr: false, // Required for Vite
});
