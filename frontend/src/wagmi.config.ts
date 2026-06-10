import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, trustWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { sepolia, anvil } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: 'uniQ',
  projectId: '1f32a752af601b38fcc8d5e8ff7b7136', // Valid WalletConnect Project ID for mobile
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
