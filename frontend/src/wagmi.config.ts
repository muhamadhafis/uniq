import { http, createConfig } from "wagmi";
import { sepolia, anvil } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia, anvil],
  connectors: [injected(), metaMask()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
    [anvil.id]:   http("http://localhost:8545"),
  },
});
